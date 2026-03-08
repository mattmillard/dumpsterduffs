"use client";

import { useEffect, useMemo, useState } from "react";
import { StatCard, DashboardGrid } from "@/components/admin/DashboardComponents";
import { AdminTable } from "@/components/admin/AdminTable";
import { InventoryModal } from "@/components/admin/InventoryModal";

type InventoryRow = {
	id: string;
	name: string;
	total_units: number;
	available_units: number;
	is_active: boolean;
};

export default function AdminInventoryPage() {
	const [inventory, setInventory] = useState<InventoryRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedInventory, setSelectedInventory] = useState<InventoryRow | null>(null);

	const loadInventory = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/admin/inventory", {
				cache: "no-store",
			});
			const data = (await response.json()) as InventoryRow[];
			setInventory(data || []);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadInventory();
	}, []);

	const metrics = useMemo(() => {
		const total = inventory.reduce((sum, row) => sum + Number(row.total_units), 0);
		const available = inventory.reduce((sum, row) => sum + Number(row.available_units), 0);
		const inUse = Math.max(0, total - available);
		return { total, available, inUse };
	}, [inventory]);

	const handleSave = async (updated: InventoryRow) => {
		const response = await fetch("/api/admin/inventory", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updated),
		});

		if (!response.ok) {
			const result = await response.json().catch(() => ({}));
			throw new Error(result.error || "Failed to update inventory");
		}

		await loadInventory();
	};

	const handleDelete = async (id: string) => {
		const response = await fetch(`/api/admin/inventory?id=${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const result = await response.json().catch(() => ({}));
			throw new Error(result.error || "Failed to delete inventory");
		}

		await loadInventory();
	};

	const rows = inventory.map((row) => ({
		...row,
		total: row.total_units,
		available: row.available_units,
		status: row.is_active ? "active" : "inactive",
	}));

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-4xl font-bold text-white">Inventory</h1>
				<p className="text-[#999999] mt-2">Live fleet availability</p>
			</div>

			<DashboardGrid cols={4}>
				<StatCard label="Total Units" value={String(metrics.total)} icon="📦" />
				<StatCard label="Available" value={String(metrics.available)} icon="✅" />
				<StatCard label="In Use" value={String(metrics.inUse)} icon="🚚" />
				<StatCard label="Maintenance" value="0" icon="🔧" />
			</DashboardGrid>

			<AdminTable
				loading={loading}
				headers={[
					{ key: "name", label: "Size" },
					{ key: "total", label: "Total Units" },
					{ key: "available", label: "Available" },
					{ key: "status", label: "Status" },
				]}
				rows={rows}
				actions={(row) => (
					<button
						onClick={() => setSelectedInventory(row as InventoryRow)}
						className="text-primary hover:text-primary-light text-sm font-medium">
						Manage
					</button>
				)}
			/>

			<InventoryModal
				inventory={selectedInventory}
				onClose={() => setSelectedInventory(null)}
				onSave={handleSave}
				onDelete={handleDelete}
			/>
		</div>
	);
}
