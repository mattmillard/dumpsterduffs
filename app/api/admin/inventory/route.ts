import { NextResponse } from "next/server";
import {
	getInventoryConfig,
	setInventoryConfig,
	sortInventoryAvailableFirst,
	type InventoryItem,
} from "@/lib/admin/config";

export async function GET() {
	try {
		const inventory = await getInventoryConfig();
		return NextResponse.json(inventory);
	} catch (error) {
		return NextResponse.json({ error: "Failed to load inventory" }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	try {
		const body = (await request.json()) as Partial<InventoryItem>;

		if (!body?.id) {
			return NextResponse.json({ error: "ID is required" }, { status: 400 });
		}

		const totalUnits = Number(body.total_units);
		const availableUnits = Number(body.available_units);

		if (!Number.isFinite(totalUnits) || !Number.isFinite(availableUnits)) {
			return NextResponse.json({ error: "total_units and available_units must be valid numbers" }, { status: 400 });
		}

		if (totalUnits < 0 || availableUnits < 0) {
			return NextResponse.json({ error: "Units cannot be negative" }, { status: 400 });
		}

		if (availableUnits > totalUnits) {
			return NextResponse.json({ error: "Available units cannot exceed total units" }, { status: 400 });
		}

		const inventory = await getInventoryConfig();
		const existingIndex = inventory.findIndex((item) => item.id === body.id);

		if (existingIndex === -1) {
			return NextResponse.json({ error: `Inventory item not found for id: ${body.id}` }, { status: 404 });
		}

		const updated = inventory.map((item) =>
			item.id === body.id
				? {
						...item,
						name: String(body.name ?? item.name),
						total_units: totalUnits,
						available_units: availableUnits,
						is_active: Boolean(body.is_active),
					}
				: item,
		);

		const sortedUpdated = sortInventoryAvailableFirst(updated);
		await setInventoryConfig(sortedUpdated);
		return NextResponse.json(sortedUpdated);
	} catch (error) {
		return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "ID is required" }, { status: 400 });
		}

		const inventory = await getInventoryConfig();
		const filtered = inventory.filter((item) => item.id !== id);

		const sortedFiltered = sortInventoryAvailableFirst(filtered);
		await setInventoryConfig(sortedFiltered);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: "Failed to delete inventory" }, { status: 500 });
	}
}
