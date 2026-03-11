import { supabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "admin-config";

type PricingItem = {
	id: string;
	name: string;
	size_yards: number;
	price_base: number;
	price_per_day: number;
	is_active: boolean;
};

type ServiceZone = {
	id: string;
	name: string;
	zone_type: string;
	delivery_fee: number;
	is_active: boolean;
};

type InventoryItem = {
	id: string;
	name: string;
	total_units: number;
	available_units: number;
	is_active: boolean;
};

const DEFAULT_PRICING: PricingItem[] = [
	{
		id: "size-10",
		name: "10 Yard",
		size_yards: 10,
		price_base: 275,
		price_per_day: 5,
		is_active: false,
	},
	{
		id: "size-15",
		name: "15 Yard",
		size_yards: 15,
		price_base: 325,
		price_per_day: 5,
		is_active: true,
	},
	{
		id: "size-20",
		name: "20 Yard",
		size_yards: 20,
		price_base: 375,
		price_per_day: 5,
		is_active: false,
	},
	{
		id: "size-30",
		name: "30 Yard",
		size_yards: 30,
		price_base: 475,
		price_per_day: 5,
		is_active: false,
	},
];

const DEFAULT_ZONES: ServiceZone[] = [
	{
		id: crypto.randomUUID(),
		name: "Columbia Metro",
		zone_type: "Zipcode",
		delivery_fee: 49.99,
		is_active: true,
	},
	{
		id: crypto.randomUUID(),
		name: "Jefferson City Area",
		zone_type: "Zipcode",
		delivery_fee: 59.99,
		is_active: true,
	},
];

const DEFAULT_INVENTORY: InventoryItem[] = [];

function mergeById<T extends { id: string }>(defaults: T[], existing: T[]): T[] {
	const existingById = new Map(existing.map((item) => [item.id, item]));
	const mergedDefaults = defaults.map((item) => ({
		...item,
		...existingById.get(item.id),
	}));
	const customItems = existing.filter((item) => !defaults.some((defaultItem) => defaultItem.id === item.id));
	return [...mergedDefaults, ...customItems];
}

function normalizePricing(pricing: PricingItem[]): PricingItem[] {
	const hasLegacySingleSize =
		pricing.length === 1 &&
		pricing[0]?.id === "size-15" &&
		Number(pricing[0]?.price_base) === 349.99 &&
		Number(pricing[0]?.price_per_day) === 30;

	const normalizedInput = hasLegacySingleSize
		? pricing.map((item) =>
				item.id === "size-15"
					? {
							...item,
							price_base: 325,
							price_per_day: 5,
						}
					: item,
			)
		: pricing;

	return mergeById(DEFAULT_PRICING, normalizedInput);
}

function normalizeInventory(inventory: InventoryItem[]): InventoryItem[] {
	// Don't merge with defaults - just return what was stored
	// This allows updates to persist without being overwritten by defaults
	return inventory;
}

function sortPricingAvailableFirst(pricing: PricingItem[]): PricingItem[] {
	return [...pricing].sort((a, b) => {
		const activeDifference = Number(b.is_active) - Number(a.is_active);
		if (activeDifference !== 0) {
			return activeDifference;
		}

		return Number(a.size_yards) - Number(b.size_yards);
	});
}

function sortInventoryAvailableFirst(inventory: InventoryItem[]): InventoryItem[] {
	return [...inventory].sort((a, b) => {
		const activeDifference = Number(b.is_active) - Number(a.is_active);
		if (activeDifference !== 0) {
			return activeDifference;
		}

		const availableDifference = Number(b.available_units) - Number(a.available_units);
		if (availableDifference !== 0) {
			return availableDifference;
		}

		return a.name.localeCompare(b.name);
	});
}

async function ensureBucket() {
	const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

	if (listError) {
		throw listError;
	}

	const exists = buckets?.some((bucket) => bucket.name === BUCKET);
	if (exists) {
		return;
	}

	const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET, {
		public: false,
		fileSizeLimit: "1MB",
	});

	if (createError && !createError.message.toLowerCase().includes("already exists")) {
		throw createError;
	}
}

async function readConfigFile<T>(path: string, defaultData: T): Promise<T> {
	await ensureBucket();

	const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(path);

	if (error || !data) {
		await writeConfigFile(path, defaultData);
		return defaultData;
	}

	const text = await data.text();
	if (!text) {
		await writeConfigFile(path, defaultData);
		return defaultData;
	}

	return JSON.parse(text) as T;
}

async function writeConfigFile<T>(path: string, value: T): Promise<void> {
	await ensureBucket();

	const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, JSON.stringify(value), {
		contentType: "application/json",
		cacheControl: "0",
		upsert: true,
	});

	if (error) {
		throw error;
	}
}

export async function getPricingConfig() {
	const pricing = await readConfigFile<PricingItem[]>("pricing.json", DEFAULT_PRICING);
	const normalized = normalizePricing(pricing);
	const sorted = sortPricingAvailableFirst(normalized);

	if (JSON.stringify(pricing) !== JSON.stringify(sorted)) {
		await writeConfigFile("pricing.json", sorted);
	}

	return sorted;
}

export async function setPricingConfig(value: PricingItem[]) {
	return writeConfigFile("pricing.json", sortPricingAvailableFirst(value));
}

export async function getZonesConfig() {
	return readConfigFile<ServiceZone[]>("zones.json", DEFAULT_ZONES);
}

export async function setZonesConfig(value: ServiceZone[]) {
	return writeConfigFile("zones.json", value);
}

export async function getInventoryConfig() {
	const inventory = await readConfigFile<InventoryItem[]>("inventory.json", DEFAULT_INVENTORY);
	const normalized = normalizeInventory(inventory);
	const sorted = sortInventoryAvailableFirst(normalized);

	if (JSON.stringify(inventory) !== JSON.stringify(sorted)) {
		await writeConfigFile("inventory.json", sorted);
	}

	return sorted;
}

export async function setInventoryConfig(value: InventoryItem[]) {
	return writeConfigFile("inventory.json", sortInventoryAvailableFirst(value));
}

export { sortPricingAvailableFirst, sortInventoryAvailableFirst };
export type { PricingItem, ServiceZone, InventoryItem };
