"use client";

import { useEffect, useState } from "react";
import { AdminButton } from "@/components/admin/AdminTable";

type CalendarSnapshot = {
  month: string;
  monthStart: string;
  monthEnd: string;
  setupRequired?: boolean;
  setupMessage?: string;
  days: DayAvailability[];
  bookings: CalendarBooking[];
  internalReservations: InternalReservation[];
  blockedDates: BlockedDate[];
  blacklist: BlacklistEntry[];
};

type DayAvailability = {
  date: string;
  deliveries: number;
  pickups: number;
  sizes: SizeAvailability[];
  blockedReasons: string[];
};

type SizeAvailability = {
  size_yards: number;
  label: string;
  capacity: number;
  activeBookings: number;
  isBlocked: boolean;
  isBookable: boolean;
};

type CalendarBooking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_date: string;
  return_date: string;
  size_yards: number;
  status: string;
  total_price: number;
};

type InternalReservation = {
  id: string;
  size_yards: number;
  start_date: string;
  pickup_date: string;
  status: "active" | "picked_up" | "pickup_missed";
  notes: string | null;
  pickup_notes: string | null;
  pickup_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

type BlockedDate = {
  id: string;
  date: string;
  size_yards: number | null;
  reason: string | null;
  is_active: boolean;
};

type BlacklistEntry = {
  id: string;
  entry_type: "phone" | "email" | "name" | "address";
  value: string;
  normalized_value: string;
  reason: string | null;
  is_active: boolean;
  created_at: string;
};

export default function AdminCalendarPage() {
  const [snapshot, setSnapshot] = useState<CalendarSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "calendar" | "bookings" | "reservations" | "blacklist"
  >("calendar");

  const loadCalendar = async (month: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(`/api/admin/calendar?month=${month}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Failed to load calendar",
        );
      }

      const data = payload as Partial<CalendarSnapshot>;
      if (
        !Array.isArray(data.days) ||
        !Array.isArray(data.bookings) ||
        !Array.isArray(data.blockedDates) ||
        !Array.isArray(data.blacklist)
      ) {
        throw new Error("Calendar payload was invalid.");
      }

      setSnapshot({
        month: data.month || month,
        monthStart: data.monthStart || `${month}-01`,
        monthEnd: data.monthEnd || `${month}-31`,
        setupRequired: Boolean(data.setupRequired),
        setupMessage: data.setupMessage,
        days: data.days,
        bookings: data.bookings,
        internalReservations: Array.isArray(data.internalReservations)
          ? data.internalReservations
          : [],
        blockedDates: data.blockedDates,
        blacklist: data.blacklist,
      });
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to load calendar operations.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar(currentMonth);
  }, [currentMonth]);

  const goToPrevMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    const prev = new Date(year, month - 2, 1);
    setCurrentMonth(
      `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  const goToNextMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    const next = new Date(year, month, 1);
    setCurrentMonth(
      `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  const blockDate = async (date: string, sizeYards?: number) => {
    const reason = prompt("Reason for blocking (optional):");
    if (reason === null) return;

    await fetch("/api/admin/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "block_date",
        date,
        size_yards: sizeYards ?? null,
        reason: reason.trim() || null,
      }),
    });

    await loadCalendar(currentMonth);
  };

  const freeDate = async (date: string, sizeYards?: number) => {
    await fetch("/api/admin/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "free_date",
        date,
        ...(sizeYards !== undefined && { size_yards: sizeYards }),
      }),
    });

    await loadCalendar(currentMonth);
  };

  const cancelBooking = async (bookingId: string) => {
    const reason = prompt("Reason for cancellation:");
    if (reason === null) return;

    await fetch("/api/admin/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "cancel_booking",
        booking_id: bookingId,
        reason: reason.trim() || undefined,
      }),
    });

    await loadCalendar(currentMonth);
  };

  const restoreBooking = async (bookingId: string) => {
    if (!confirm("Restore this booking?")) return;

    await fetch("/api/admin/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "restore_booking",
        booking_id: bookingId,
      }),
    });

    await loadCalendar(currentMonth);
  };

  const addToBlacklist = async () => {
    const entryType = prompt("Entry type (phone, email, name, address):") as
      | "phone"
      | "email"
      | "name"
      | "address"
      | null;
    if (
      !entryType ||
      !["phone", "email", "name", "address"].includes(entryType)
    )
      return;

    const value = prompt(`Enter ${entryType} to block:`);
    if (!value?.trim()) return;

    const reason = prompt("Reason (optional):");

    await fetch("/api/admin/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "blacklist_add",
        entry_type: entryType,
        value: value.trim(),
        reason: reason?.trim() || null,
      }),
    });

    await loadCalendar(currentMonth);
  };

  const toggleBlacklist = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "blacklist_toggle",
        id,
        is_active: !isActive,
      }),
    });

    await loadCalendar(currentMonth);
  };

  const reserveDumpster = async () => {
    const sizeRaw = prompt("Dumpster size in yards (10, 15, 20, 30):");
    if (!sizeRaw) return;

    const sizeYards = Number(sizeRaw);
    if (!Number.isFinite(sizeYards) || sizeYards <= 0) {
      alert("Enter a valid dumpster size.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const startDate = prompt("Reservation start date (YYYY-MM-DD):", today);
    if (!startDate) return;

    const pickupDate = prompt(
      "Planned pickup date (YYYY-MM-DD):",
      selectedDate || startDate,
    );
    if (!pickupDate) return;

    const notes = prompt("Notes (optional):") || "";

    const response = await fetch("/api/admin/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reserve_dumpster",
        size_yards: sizeYards,
        start_date: startDate,
        pickup_date: pickupDate,
        notes: notes.trim() || undefined,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      alert(payload?.error || "Failed to reserve dumpster.");
      return;
    }

    await loadCalendar(currentMonth);
  };

  const submitReservationOutcome = async (
    reservation: InternalReservation,
    outcome: "picked_up" | "pickup_missed",
  ) => {
    let pickupDate: string | undefined;
    let pickupNotes: string | undefined;

    if (outcome === "pickup_missed") {
      pickupDate =
        prompt(
          "Pickup did not happen. Enter new pickup date (YYYY-MM-DD):",
          reservation.pickup_date,
        ) || undefined;

      if (!pickupDate) return;
    }

    pickupNotes = prompt("Pickup notes (optional):") || undefined;

    const response = await fetch("/api/admin/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reservation_pickup_outcome",
        id: reservation.id,
        outcome,
        pickup_date: pickupDate,
        pickup_notes: pickupNotes,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      alert(payload?.error || "Failed to update pickup outcome.");
      return;
    }

    await loadCalendar(currentMonth);
  };

  if (loading && !snapshot) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-white">Calendar</h1>
        <div className="bg-[#1A1A1A] border border-[#404040] rounded-lg p-12 text-center">
          <p className="text-[#999999]">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (!snapshot && loadError) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-white">Calendar</h1>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            Calendar Unavailable
          </h2>
          <p className="text-white mb-4">{loadError}</p>
          <AdminButton
            variant="secondary"
            onClick={() => loadCalendar(currentMonth)}
          >
            Retry
          </AdminButton>
        </div>
      </div>
    );
  }

  if (snapshot?.setupRequired) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-white">Calendar</h1>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            Setup Required
          </h2>
          <p className="text-white mb-4">{snapshot.setupMessage}</p>
          <p className="text-sm text-[#999999]">
            Run the SQL schema file in your Supabase SQL Editor:
            <br />
            <code className="text-primary">
              supabase/BOOKING_OPERATIONS_SCHEMA.sql
            </code>
          </p>
        </div>
      </div>
    );
  }

  const monthLabel = new Date(`${currentMonth}-01`).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );

  const selectedDay = selectedDate
    ? snapshot?.days.find((d) => d.date === selectedDate)
    : null;

  const dayBookings = selectedDate
    ? snapshot?.bookings.filter(
        (b) => b.delivery_date <= selectedDate && b.return_date >= selectedDate,
      ) || []
    : [];

  const dayReservations = selectedDate
    ? snapshot?.internalReservations.filter(
        (reservation) =>
          reservation.start_date <= selectedDate &&
          reservation.pickup_date >= selectedDate &&
          reservation.status === "active",
      ) || []
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Calendar</h1>
          <p className="text-[#999999] mt-2">
            Manage bookings, block dates, and availability
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AdminButton variant="secondary" onClick={addToBlacklist}>
            + Blacklist Entry
          </AdminButton>
          <AdminButton variant="primary" onClick={reserveDumpster}>
            + Reserve Dumpster
          </AdminButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#404040]">
        {(["calendar", "bookings", "reservations", "blacklist"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-[#999999] hover:text-white"
              }`}
            >
              {tab}
              {tab === "bookings" && snapshot && (
                <span className="ml-2 text-xs bg-[#404040] px-2 py-1 rounded">
                  {
                    (snapshot.bookings || []).filter((b) =>
                      ["pending", "scheduled", "in_progress"].includes(
                        b.status,
                      ),
                    ).length
                  }
                </span>
              )}
              {tab === "reservations" && snapshot && (
                <span className="ml-2 text-xs bg-[#404040] px-2 py-1 rounded">
                  {
                    (snapshot.internalReservations || []).filter(
                      (reservation) => reservation.status === "active",
                    ).length
                  }
                </span>
              )}
              {tab === "blacklist" && snapshot && (
                <span className="ml-2 text-xs bg-[#404040] px-2 py-1 rounded">
                  {(snapshot.blacklist || []).filter((b) => b.is_active).length}
                </span>
              )}
            </button>
          ),
        )}
      </div>

      {/* Calendar Tab */}
      {activeTab === "calendar" && (
        <>
          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-[#1A1A1A] border border-[#404040] rounded-lg p-4">
            <button
              onClick={goToPrevMonth}
              className="text-white hover:text-primary transition-colors"
            >
              ← Prev
            </button>
            <div className="flex gap-3 items-center">
              <h2 className="text-lg font-bold text-white">{monthLabel}</h2>
              <button
                onClick={goToToday}
                className="text-sm text-primary hover:underline"
              >
                Today
              </button>
            </div>
            <button
              onClick={goToNextMonth}
              className="text-white hover:text-primary transition-colors"
            >
              Next →
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <div className="lg:col-span-2">
              <div className="bg-[#1A1A1A] border border-[#404040] rounded-lg p-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-xs font-semibold text-[#999999] text-center py-2"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const firstDay = new Date(`${currentMonth}-01`);
                    const startDay = firstDay.getUTCDay();
                    const daysInMonth = snapshot?.days.length || 0;
                    const cells = [];

                    // Empty cells before month starts
                    for (let i = 0; i < startDay; i++) {
                      cells.push(
                        <div
                          key={`empty-${i}`}
                          className="aspect-square bg-[#0F0F0F] rounded"
                        />,
                      );
                    }

                    // Month days
                    snapshot?.days.forEach((day) => {
                      const dateObj = new Date(`${day.date}T00:00:00`);
                      const dayNum = dateObj.getUTCDate();
                      const isToday =
                        day.date === new Date().toISOString().split("T")[0];
                      const isSelected = day.date === selectedDate;
                      const isBlocked = day.blockedReasons.length > 0;
                      const hasBookings = day.deliveries > 0 || day.pickups > 0;

                      cells.push(
                        <button
                          key={day.date}
                          onClick={() => setSelectedDate(day.date)}
                          className={`aspect-square rounded p-2 text-left transition-all ${
                            isSelected
                              ? "bg-primary/20 border-2 border-primary"
                              : isBlocked
                                ? "bg-red-500/10 border border-red-500/30 hover:bg-red-500/20"
                                : hasBookings
                                  ? "bg-[#262626] border border-primary/30 hover:border-primary"
                                  : "bg-[#262626] border border-[#404040] hover:border-[#666666]"
                          } ${isToday ? "ring-2 ring-primary/50" : ""}`}
                        >
                          <div className="text-xs font-semibold text-white mb-1">
                            {dayNum}
                          </div>
                          {hasBookings && (
                            <div className="text-[10px] text-primary">
                              {day.deliveries > 0 && `↓${day.deliveries}`}
                              {day.pickups > 0 && ` ↑${day.pickups}`}
                            </div>
                          )}
                          {isBlocked && (
                            <div className="text-[10px] text-red-400">🚫</div>
                          )}
                        </button>,
                      );
                    });

                    return cells;
                  })()}
                </div>
              </div>
            </div>

            {/* Day Detail Panel */}
            <div className="lg:col-span-1">
              {selectedDay ? (
                <div className="bg-[#1A1A1A] border border-[#404040] rounded-lg p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {new Date(
                        `${selectedDay.date}T00:00:00`,
                      ).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </h3>
                    <p className="text-sm text-[#999999]">
                      {dayBookings.length} active booking(s) •{" "}
                      {dayReservations.length} internal reservation(s)
                    </p>
                  </div>

                  {/* Blocked Reasons */}
                  {selectedDay.blockedReasons.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-400 uppercase mb-2">
                        🚫 Blocked
                      </p>
                      <div className="space-y-1">
                        {selectedDay.blockedReasons.map((reason, idx) => (
                          <p key={idx} className="text-sm text-red-300">
                            {reason}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Availability */}
                  <div>
                    <p className="text-xs font-semibold text-[#999999] uppercase mb-2">
                      Dumpster Availability
                    </p>
                    <div className="space-y-2">
                      {selectedDay.sizes.map((size) => (
                        <div
                          key={size.size_yards}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-white">{size.label}</span>
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                size.isBlocked
                                  ? "text-red-400"
                                  : size.isBookable
                                    ? "text-green-400"
                                    : "text-yellow-400"
                              }
                            >
                              {size.activeBookings}/{size.capacity}
                            </span>
                            {!size.isBlocked && (
                              <button
                                onClick={() =>
                                  blockDate(selectedDay.date, size.size_yards)
                                }
                                className="text-xs text-red-400 hover:underline"
                              >
                                Block
                              </button>
                            )}
                            {size.isBlocked && (
                              <button
                                onClick={() =>
                                  freeDate(selectedDay.date, size.size_yards)
                                }
                                className="text-xs text-green-400 hover:underline"
                              >
                                Free
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Block All / Free All */}
                  <div className="flex gap-2 pt-2 border-t border-[#404040]">
                    <button
                      onClick={() => blockDate(selectedDay.date)}
                      className="flex-1 text-sm py-2 px-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                    >
                      Block All Sizes
                    </button>
                    <button
                      onClick={() => freeDate(selectedDay.date)}
                      className="flex-1 text-sm py-2 px-3 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition-colors"
                    >
                      Free All
                    </button>
                  </div>

                  {/* Bookings for Day */}
                  {dayBookings.length > 0 && (
                    <div className="pt-4 border-t border-[#404040]">
                      <p className="text-xs font-semibold text-[#999999] uppercase mb-2">
                        Active Bookings
                      </p>
                      <div className="space-y-2">
                        {dayBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="text-sm bg-[#262626] p-2 rounded"
                          >
                            <p className="text-white font-semibold">
                              {booking.customer_name}
                            </p>
                            <p className="text-xs text-[#999999]">
                              {booking.size_yards}Y • {booking.delivery_date} →{" "}
                              {booking.return_date}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Internal Reservations for Day */}
                  {dayReservations.length > 0 && (
                    <div className="pt-4 border-t border-[#404040]">
                      <p className="text-xs font-semibold text-[#999999] uppercase mb-2">
                        Internal Reservations
                      </p>
                      <div className="space-y-2">
                        {dayReservations.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="text-sm bg-[#262626] p-3 rounded space-y-2"
                          >
                            <p className="text-white font-semibold">
                              {reservation.size_yards} Yard Internal Hold
                            </p>
                            <p className="text-xs text-[#999999]">
                              {reservation.start_date} →{" "}
                              {reservation.pickup_date}
                            </p>
                            {reservation.notes && (
                              <p className="text-xs text-[#B3D4FF]">
                                {reservation.notes}
                              </p>
                            )}
                            {selectedDay.date === reservation.pickup_date && (
                              <div className="flex gap-3">
                                <button
                                  onClick={() =>
                                    submitReservationOutcome(
                                      reservation,
                                      "picked_up",
                                    )
                                  }
                                  className="text-xs text-green-400 hover:underline"
                                >
                                  Confirm Pickup
                                </button>
                                <button
                                  onClick={() =>
                                    submitReservationOutcome(
                                      reservation,
                                      "pickup_missed",
                                    )
                                  }
                                  className="text-xs text-yellow-300 hover:underline"
                                >
                                  Pickup Did Not Happen
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#1A1A1A] border border-[#404040] rounded-lg p-8 text-center">
                  <p className="text-[#999999]">
                    Click a date to view details and manage availability
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="bg-[#1A1A1A] border border-[#404040] rounded-lg divide-y divide-[#404040]">
          {snapshot?.bookings.length === 0 ? (
            <div className="p-8 text-center text-[#999999]">
              No bookings found.
            </div>
          ) : (
            snapshot?.bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-white font-semibold">
                      {booking.customer_name}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        booking.status === "cancelled"
                          ? "bg-red-500/20 text-red-400"
                          : booking.status === "in_progress"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#999999]">
                    {booking.size_yards} Yard • {booking.customer_phone}
                  </p>
                  <p className="text-xs text-[#666666] mt-1">
                    #{booking.id.slice(0, 8)} • $
                    {booking.total_price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white mb-1">
                    {booking.delivery_date} → {booking.return_date}
                  </p>
                  <div className="flex gap-2">
                    {booking.status === "cancelled" ? (
                      <button
                        onClick={() => restoreBooking(booking.id)}
                        className="text-xs text-green-400 hover:underline"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === "reservations" && (
        <div className="bg-[#1A1A1A] border border-[#404040] rounded-lg divide-y divide-[#404040]">
          {snapshot?.internalReservations.length === 0 ? (
            <div className="p-8 text-center text-[#999999]">
              No internal reservations.
            </div>
          ) : (
            snapshot?.internalReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-white font-semibold">
                      {reservation.size_yards} Yard Internal Reservation
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        reservation.status === "picked_up"
                          ? "bg-green-500/20 text-green-400"
                          : reservation.status === "pickup_missed"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#999999]">
                    {reservation.start_date} → {reservation.pickup_date}
                  </p>
                  {reservation.notes && (
                    <p className="text-xs text-[#B3D4FF] mt-1">
                      {reservation.notes}
                    </p>
                  )}
                  {reservation.pickup_notes && (
                    <p className="text-xs text-[#999999] mt-1">
                      Pickup notes: {reservation.pickup_notes}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs text-[#666666] mb-2">
                    #{reservation.id.slice(0, 8)}
                  </p>
                  {reservation.status === "active" && (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() =>
                          submitReservationOutcome(reservation, "picked_up")
                        }
                        className="text-xs text-green-400 hover:underline"
                      >
                        Confirm Pickup
                      </button>
                      <button
                        onClick={() =>
                          submitReservationOutcome(reservation, "pickup_missed")
                        }
                        className="text-xs text-yellow-300 hover:underline"
                      >
                        Did Not Happen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Blacklist Tab */}
      {activeTab === "blacklist" && (
        <div className="bg-[#1A1A1A] border border-[#404040] rounded-lg divide-y divide-[#404040]">
          {snapshot?.blacklist.length === 0 ? (
            <div className="p-8 text-center text-[#999999]">
              No blacklist entries.
            </div>
          ) : (
            snapshot?.blacklist.map((entry) => (
              <div
                key={entry.id}
                className="p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs px-2 py-1 rounded bg-[#404040] text-white">
                      {entry.entry_type}
                    </span>
                    <p className="text-white font-mono">{entry.value}</p>
                  </div>
                  {entry.reason && (
                    <p className="text-sm text-[#999999] mt-1">
                      {entry.reason}
                    </p>
                  )}
                  <p className="text-xs text-[#666666] mt-1">
                    Added {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleBlacklist(entry.id, entry.is_active)}
                  className={`text-xs px-3 py-2 rounded transition-colors ${
                    entry.is_active
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  }`}
                >
                  {entry.is_active ? "Disable" : "Enable"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
