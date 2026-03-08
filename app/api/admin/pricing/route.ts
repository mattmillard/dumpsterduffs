import { NextResponse } from "next/server";
import { getPricingConfig, setPricingConfig, sortPricingAvailableFirst, type PricingItem } from "@/lib/admin/config";

export async function GET() {
	try {
		const pricing = await getPricingConfig();
		return NextResponse.json(pricing);
	} catch (error) {
		return NextResponse.json({ error: "Failed to load pricing" }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	try {
		const body = (await request.json()) as PricingItem;
		const pricing = await getPricingConfig();

		const updated = pricing.map((item) =>
			item.id === body.id
				? {
						...item,
						name: body.name,
						size_yards: Number(body.size_yards),
						price_base: Number(body.price_base),
						price_per_day: Number(body.price_per_day),
						is_active: Boolean(body.is_active),
					}
				: item,
		);

		const sortedUpdated = sortPricingAvailableFirst(updated);
		await setPricingConfig(sortedUpdated);
		return NextResponse.json(sortedUpdated);
	} catch (error) {
		return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as Partial<PricingItem>;
		const pricing = await getPricingConfig();

		const name = String(body.name || "").trim();
		const sizeYards = Number(body.size_yards);
		const basePrice = Number(body.price_base);
		const perDayPrice = Number(body.price_per_day);

		if (!name || !Number.isFinite(sizeYards) || sizeYards <= 0) {
			return NextResponse.json({ error: "Invalid size name or yard size" }, { status: 400 });
		}

		if (!Number.isFinite(basePrice) || basePrice < 0) {
			return NextResponse.json({ error: "Invalid base price" }, { status: 400 });
		}

		if (!Number.isFinite(perDayPrice) || perDayPrice < 0) {
			return NextResponse.json({ error: "Invalid extra day price" }, { status: 400 });
		}

		const slugId = `size-${sizeYards}`;
		const id = pricing.some((item) => item.id === slugId) ? `${slugId}-${crypto.randomUUID().slice(0, 8)}` : slugId;

		const created: PricingItem = {
			id,
			name,
			size_yards: sizeYards,
			price_base: basePrice,
			price_per_day: perDayPrice,
			is_active: body.is_active ?? false,
		};

		const updated = sortPricingAvailableFirst([...pricing, created]);
		await setPricingConfig(updated);

		return NextResponse.json(updated);
	} catch (error) {
		return NextResponse.json({ error: "Failed to create pricing size" }, { status: 500 });
	}
}
