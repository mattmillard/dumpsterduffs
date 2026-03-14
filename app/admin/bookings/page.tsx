"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminTable, AdminButton } from "@/components/admin/AdminTable";

type BookingRow = {
  id: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  customer_company?: string | null;
  size_yards: number;
  delivery_date: string;
  return_date: string;
  total_price: number;
  subtotal?: number | null;
  delivery_fee?: number | null;
  tax?: number | null;
  status: string;
  payment_status?: string | null;
  delivery_address_line_1?: string | null;
  delivery_address_line_2?: string | null;
  delivery_city?: string | null;
  delivery_state?: string | null;
  delivery_zip?: string | null;
  placement_notes?: string | null;
};

const STATUS_OPTIONS = [
  "pending",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<BookingRow | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const buildFullAddress = (booking: BookingRow) => {
    const addressParts = [
      booking.delivery_address_line_1,
      booking.delivery_address_line_2,
      [booking.delivery_city, booking.delivery_state, booking.delivery_zip]
        .filter(Boolean)
        .join(" "),
    ]
      .filter((part) => Boolean(part && String(part).trim()))
      .map((part) => String(part).trim());

    return addressParts.join(", ");
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/bookings", {
        cache: "no-store",
      });
      const data = (await response.json()) as BookingRow[];
      setBookings(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateStatus = async (booking: BookingRow) => {
    setEditingBooking(booking);
    setSelectedStatus(booking.status);
  };

  const handleStatusUpdate = async () => {
    if (!editingBooking || !selectedStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingBooking.id, status: selectedStatus }),
      });

      if (response.ok) {
        setEditingBooking(null);
        setSelectedStatus("");
        await loadBookings();
      } else {
        alert("Failed to update booking status");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    setEditingBooking(null);
    setSelectedStatus("");
  };

  const deleteBooking = async (booking: BookingRow) => {
    const confirmed = window.confirm(
      `Delete booking for ${booking.customer_name} on ${booking.delivery_date}? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/bookings?id=${booking.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to delete booking: ${error.error || "Unknown error"}`);
        return;
      }

      await loadBookings();
    } catch (error) {
      alert("Failed to delete booking. Please try again.");
      console.error("Delete error:", error);
    }
  };

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      const haystack =
        `${booking.id} ${booking.customer_name} ${booking.customer_phone} ${booking.customer_email || ""} ${buildFullAddress(booking)} ${booking.placement_notes || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const rows = filtered.map((booking) => ({
    ...booking,
    booking_number: booking.id.slice(0, 8),
    customer: (
      <div className="space-y-1">
        <p className="font-semibold text-white">{booking.customer_name}</p>
        <p className="text-xs text-[#999999]">{booking.customer_phone}</p>
        {booking.customer_email && (
          <p className="text-xs text-[#B3D4FF]">{booking.customer_email}</p>
        )}
        {booking.customer_company && (
          <p className="text-xs text-[#999999]">{booking.customer_company}</p>
        )}
      </div>
    ),
    address: (
      <div className="space-y-1">
        <p className="text-sm text-white">{buildFullAddress(booking) || "Address unavailable"}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildFullAddress(booking))}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary hover:text-primary-light"
        >
          Open drop-off in Google Maps
        </a>
      </div>
    ),
    size: `${booking.size_yards} Yard`,
    delivery: (
      <div className="space-y-1">
        <p className="text-sm text-white">Drop off: {booking.delivery_date}</p>
        <p className="text-xs text-[#999999]">Pick up: {booking.return_date}</p>
      </div>
    ),
    total: `$${Number(booking.total_price).toFixed(2)}`,
    notes: booking.placement_notes || "—",
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Bookings</h1>
          <p className="text-[#999999] mt-2">Live customer bookings</p>
        </div>
        <AdminButton variant="secondary" onClick={loadBookings}>
          Refresh
        </AdminButton>
      </div>

      <div className="bg-[#1A1A1A] border border-[#404040] rounded-lg p-4 flex flex-col md:flex-row gap-4">
        <input
          type="search"
          placeholder="Search by booking id, customer, phone, email, address, or notes..."
          className="input-field flex-1"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="input-field w-full md:w-48"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <AdminTable
        loading={loading}
        headers={[
          { key: "booking_number", label: "Booking #" },
          { key: "customer", label: "Customer" },
          { key: "address", label: "Drop-Off Address" },
          { key: "size", label: "Size" },
          { key: "delivery", label: "Delivery Date" },
          { key: "total", label: "Total" },
          { key: "notes", label: "Placement Notes" },
          { key: "status", label: "Status" },
        ]}
        rows={rows}
        actions={(row) => (
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateStatus(row as BookingRow)}
              className="text-primary hover:text-primary-light text-sm font-medium"
            >
              Edit Status
            </button>
            <button
              onClick={() => deleteBooking(row as BookingRow)}
              className="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        )}
      />

      {/* Status Update Modal */}
      {editingBooking && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1A1A1A] border border-[#404040] rounded-lg p-8 max-w-md w-full z-50 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              Update Booking Status
            </h2>
            <p className="text-[#999999] mb-6">
              Booking: {editingBooking.id.slice(0, 8)} •{" "}
              {editingBooking.customer_name}
            </p>

            <div className="space-y-4 mb-6">
              <label className="block">
                <span className="text-sm font-medium text-[#999999] mb-2 block">
                  Select New Status
                </span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input-field w-full"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStatusUpdate}
                disabled={
                  isUpdating || selectedStatus === editingBooking.status
                }
                className="flex-1 bg-primary hover:bg-primary-dark disabled:bg-[#404040] disabled:text-[#999999] text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </button>
              <button
                onClick={closeModal}
                disabled={isUpdating}
                className="flex-1 bg-[#2A2A2A] hover:bg-[#3A3A3A] disabled:bg-[#404040] text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
