import { NextResponse } from "next/server";
import { getPricingConfig, sortPricingAvailableFirst } from "@/lib/admin/config";

export async function GET() {
	try {
		const pricing = await getPricingConfig();
		const sortedPricing = sortPricingAvailableFirst(pricing);

		const sizes = sortedPricing.map((item) => ({
			id: item.id,
			size_yards: item.size_yards,
			name: item.name,
			description: `Live pricing managed from Admin → Pricing`,
			price_base: Number(item.price_base),
			price_per_day: Number(item.price_per_day),
			dimensions: { length: 17, width: 8, height: 4 },
			ideal_for: ["Home remodels", "Garage cleanouts", "Roofing projects", "Estate cleanouts"],
			is_active: item.is_active, // Include availability status
		}));

		return NextResponse.json(sizes);
	} catch (error) {
		return NextResponse.json({ error: "Failed to load sizes" }, { status: 500 });
	}
}
