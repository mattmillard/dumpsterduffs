import { getInventoryConfig, getPricingConfig } from "@/lib/admin/config";
import { supabaseAdmin } from "@/lib/supabase/admin";

type BookingRecord = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_date: string;
  return_date: string;
  size_yards: number;
  status: string;
  total_price?: number;
};

export type CalendarBookingEvent = {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_date: string;
  return_date: string;
  size_yards: number;
  status: string;
  total_price: number;
};

export type BlockedDate = {
  id: string;
  date: string;
  size_yards: number | null;
  reason: string | null;
  is_active: boolean;
};

export type BlacklistEntry = {
  id: string;
  entry_type: "phone" | "email" | "name" | "address";
  value: string;
  normalized_value: string;
  reason: string | null;
  is_active: boolean;
  created_at: string;
};

export type DayAvailability = {
  date: string;
  deliveries: number;
  pickups: number;
  sizes: Array<{
    size_yards: number;
    label: string;
    capacity: number;
    activeBookings: number;
    isBlocked: boolean;
    isBookable: boolean;
  }>;
  blockedReasons: string[];
};

export type CalendarSnapshot = {
  month: string;
  monthStart: string;
  monthEnd: string;
  setupRequired: boolean;
  setupMessage?: string;
  blockedDates: BlockedDate[];
  blacklist: BlacklistEntry[];
  bookings: CalendarBookingEvent[];
  days: DayAvailability[];
};

const ACTIVE_BOOKING_STATUSES = new Set([
  "pending",
  "scheduled",
  "in_progress",
]);

export function isActiveBookingStatus(status: string): boolean {
  return ACTIVE_BOOKING_STATUSES.has(status);
}

export class BookingCapacityError extends Error {
  reason: string;
  conflictingDate?: string;

  constructor(message: string, reason: string, conflictingDate?: string) {
    super(message);
    this.name = "BookingCapacityError";
    this.reason = reason;
    this.conflictingDate = conflictingDate;
  }
}

type BookingCapacityParams = {
  delivery_date: string;
  return_date: string;
  size_yards: number;
  exclude_booking_id?: string;
};

type BookingCapacityResult = {
  bookable: boolean;
  reason?:
    | "invalid_dates"
    | "size_not_available"
    | "date_blocked"
    | "no_capacity";
  message: string;
  conflictingDate?: string;
  capacity?: number;
  activeBookings?: number;
};

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeAddress(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeBlacklistValue(type: string, value: string): string {
  if (type === "phone") return normalizePhone(value);
  if (type === "email") return normalizeEmail(value);
  if (type === "name") return normalizeName(value);
  return normalizeAddress(value);
}

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === "42P01" ||
    maybeError.message?.toLowerCase().includes("does not exist") === true
  );
}

function getMonthRange(month: string) {
  const [yearRaw, monthRaw] = month.split("-");
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;

  const first = new Date(Date.UTC(year, monthIndex, 1));
  const last = new Date(Date.UTC(year, monthIndex + 1, 0));

  return {
    start: first.toISOString().split("T")[0],
    end: last.toISOString().split("T")[0],
  };
}

function listDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${start}T00:00:00.000Z`);
  const last = new Date(`${end}T00:00:00.000Z`);

  while (current <= last) {
    dates.push(current.toISOString().split("T")[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

function bookingOccupiesDate(booking: BookingRecord, date: string): boolean {
  return booking.delivery_date <= date && booking.return_date >= date;
}

async function fetchBookingsForRange(start: string, end: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, customer_name, customer_phone, customer_email, delivery_date, return_date, size_yards, status, total_price",
    )
    .lte("delivery_date", end)
    .gte("return_date", start)
    .order("delivery_date", { ascending: true });

  if (error) throw error;
  return (data || []) as BookingRecord[];
}

async function fetchBlockedDatesForRange(start: string, end: string) {
  const { data, error } = await supabaseAdmin
    .from("booking_blocked_dates")
    .select("id, date, size_yards, reason, is_active")
    .gte("date", start)
    .lte("date", end)
    .eq("is_active", true)
    .order("date", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) return [] as BlockedDate[];
    throw error;
  }

  return (data || []) as BlockedDate[];
}

async function fetchBlacklistEntries() {
  const { data, error } = await supabaseAdmin
    .from("booking_blacklist")
    .select(
      "id, entry_type, value, normalized_value, reason, is_active, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (isMissingTableError(error)) return [] as BlacklistEntry[];
    throw error;
  }

  return (data || []) as BlacklistEntry[];
}

export async function getCalendarSnapshot(
  month: string,
): Promise<CalendarSnapshot> {
  const { start, end } = getMonthRange(month);

  let bookings: BookingRecord[] = [];
  let blockedDates: BlockedDate[] = [];
  let blacklist: BlacklistEntry[] = [];

  try {
    [bookings, blockedDates, blacklist] = await Promise.all([
      fetchBookingsForRange(start, end),
      fetchBlockedDatesForRange(start, end),
      fetchBlacklistEntries(),
    ]);
  } catch (error) {
    if (isMissingTableError(error)) {
      return {
        month,
        monthStart: start,
        monthEnd: end,
        setupRequired: true,
        setupMessage:
          "Booking operations tables are not set up yet. Run SUPABASE_BOOKING_OPS_SCHEMA.sql in Supabase SQL Editor.",
        blockedDates: [],
        blacklist: [],
        bookings: [],
        days: [],
      };
    }
    throw error;
  }

  const [pricing, inventory] = await Promise.all([
    getPricingConfig(),
    getInventoryConfig(),
  ]);

  const activeSizes = pricing
    .filter((size) => size.is_active)
    .sort((a, b) => Number(a.size_yards) - Number(b.size_yards));

  const capacityByYards = new Map<number, number>();
  for (const size of activeSizes) {
    const matchedInventory =
      inventory.find((item) => item.id === size.id) ||
      inventory.find(
        (item) => item.name.toLowerCase() === size.name.toLowerCase(),
      );

    capacityByYards.set(
      Number(size.size_yards),
      Math.max(0, Number(matchedInventory?.total_units ?? 0)),
    );
  }

  const dates = listDatesInRange(start, end);
  const activeBookings = bookings.filter((booking) =>
    ACTIVE_BOOKING_STATUSES.has(booking.status),
  );

  const dayAvailability: DayAvailability[] = dates.map((date) => {
    const dayDeliveries = activeBookings.filter(
      (booking) => booking.delivery_date === date,
    ).length;
    const dayPickups = activeBookings.filter(
      (booking) => booking.return_date === date,
    ).length;

    const blockedForDate = blockedDates.filter(
      (blocked) => blocked.date === date,
    );
    const blockedReasons = blockedForDate
      .map((blocked) => blocked.reason || "Blocked")
      .filter(Boolean);

    const sizes = activeSizes.map((size) => {
      const sizeYards = Number(size.size_yards);
      const capacity = capacityByYards.get(sizeYards) ?? 0;
      const currentBooked = activeBookings.filter(
        (booking) =>
          booking.size_yards === sizeYards &&
          bookingOccupiesDate(booking, date),
      ).length;

      const globalBlocked = blockedForDate.some(
        (blocked) => blocked.size_yards == null,
      );
      const sizeBlocked = blockedForDate.some(
        (blocked) => blocked.size_yards === sizeYards,
      );
      const isBlocked = globalBlocked || sizeBlocked;
      const isBookable = !isBlocked && currentBooked < capacity;

      return {
        size_yards: sizeYards,
        label: `${sizeYards} Yard`,
        capacity,
        activeBookings: currentBooked,
        isBlocked,
        isBookable,
      };
    });

    return {
      date,
      deliveries: dayDeliveries,
      pickups: dayPickups,
      sizes,
      blockedReasons,
    };
  });

  return {
    month,
    monthStart: start,
    monthEnd: end,
    setupRequired: false,
    blockedDates,
    blacklist,
    bookings: bookings.map((booking) => ({
      ...booking,
      total_price: Number(booking.total_price || 0),
    })),
    days: dayAvailability,
  };
}

export async function blockDate(params: {
  date: string;
  size_yards?: number | null;
  reason?: string;
}) {
  const { error } = await supabaseAdmin.from("booking_blocked_dates").insert({
    date: params.date,
    size_yards: params.size_yards ?? null,
    reason: params.reason || null,
    is_active: true,
  });

  if (error) throw error;
}

export async function freeDate(params: {
  id?: string;
  date?: string;
  size_yards?: number | null;
}) {
  if (params.id) {
    const { error } = await supabaseAdmin
      .from("booking_blocked_dates")
      .update({ is_active: false })
      .eq("id", params.id);

    if (error) throw error;
    return;
  }

  if (!params.date) {
    throw new Error("date is required when id is not provided");
  }

  let query = supabaseAdmin
    .from("booking_blocked_dates")
    .update({ is_active: false })
    .eq("date", params.date)
    .eq("is_active", true);

  if (params.size_yards == null) {
    query = query.is("size_yards", null);
  } else {
    query = query.eq("size_yards", params.size_yards);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const updatePayload: Record<string, unknown> = {
    status: "cancelled",
    updated_at: new Date().toISOString(),
  };

  if (reason) {
    updatePayload.cancellation_reason = reason;
  }

  let result = await supabaseAdmin
    .from("bookings")
    .update(updatePayload)
    .eq("id", bookingId)
    .select("id")
    .single();

  if (result.error && (result.error as { code?: string }).code === "42703") {
    result = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", bookingId)
      .select("id")
      .single();
  }

  if (result.error) throw result.error;

  const logInsert = await supabaseAdmin.from("booking_activity_log").insert({
    booking_id: bookingId,
    action: "cancelled",
    notes: reason || null,
  });

  if (logInsert.error && !isMissingTableError(logInsert.error)) {
    throw logInsert.error;
  }
}

export async function restoreBooking(bookingId: string) {
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("id, delivery_date, return_date, size_yards")
    .eq("id", bookingId)
    .single();

  if (bookingError) throw bookingError;

  const capacityCheck = await checkBookingCapacity({
    delivery_date: booking.delivery_date,
    return_date: booking.return_date,
    size_yards: Number(booking.size_yards),
    exclude_booking_id: booking.id,
  });

  if (!capacityCheck.bookable) {
    throw new BookingCapacityError(
      capacityCheck.message,
      capacityCheck.reason || "no_capacity",
      capacityCheck.conflictingDate,
    );
  }

  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ status: "scheduled", updated_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select("id")
    .single();

  if (error) throw error;
}

export async function addBlacklistEntry(params: {
  entry_type: "phone" | "email" | "name" | "address";
  value: string;
  reason?: string;
}) {
  const normalized_value = normalizeBlacklistValue(
    params.entry_type,
    params.value,
  );

  const { error } = await supabaseAdmin.from("booking_blacklist").insert({
    entry_type: params.entry_type,
    value: params.value,
    normalized_value,
    reason: params.reason || null,
    is_active: true,
  });

  if (error) throw error;
}

export async function toggleBlacklistEntry(id: string, isActive: boolean) {
  const { error } = await supabaseAdmin
    .from("booking_blacklist")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw error;
}

export async function getBookabilityForDate(date: string) {
  const month = date.slice(0, 7);
  const snapshot = await getCalendarSnapshot(month);

  if (snapshot.setupRequired) {
    return {
      setupRequired: true,
      setupMessage: snapshot.setupMessage,
      date,
      sizes: [],
    };
  }

  const day = snapshot.days.find((item) => item.date === date);
  return {
    setupRequired: false,
    date,
    sizes: day?.sizes || [],
    blockedReasons: day?.blockedReasons || [],
  };
}

export async function checkBookingCapacity(
  params: BookingCapacityParams,
): Promise<BookingCapacityResult> {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (
    !datePattern.test(params.delivery_date) ||
    !datePattern.test(params.return_date) ||
    params.return_date < params.delivery_date
  ) {
    return {
      bookable: false,
      reason: "invalid_dates",
      message: "Invalid booking date range.",
    };
  }

  const sizeYards = Number(params.size_yards);
  const [pricing, inventory] = await Promise.all([
    getPricingConfig(),
    getInventoryConfig(),
  ]);

  const sizeConfig = pricing.find(
    (size) => size.is_active && Number(size.size_yards) === sizeYards,
  );

  if (!sizeConfig) {
    return {
      bookable: false,
      reason: "size_not_available",
      message: "This dumpster size is not available.",
    };
  }

  const matchedInventory =
    inventory.find((item) => item.id === sizeConfig.id) ||
    inventory.find(
      (item) => item.name.toLowerCase() === sizeConfig.name.toLowerCase(),
    );

  const capacity = Math.max(0, Number(matchedInventory?.total_units ?? 0));

  if (capacity <= 0) {
    return {
      bookable: false,
      reason: "no_capacity",
      message: "No units are configured for this dumpster size.",
      capacity,
      activeBookings: 0,
    };
  }

  const [bookings, blockedDates] = await Promise.all([
    fetchBookingsForRange(params.delivery_date, params.return_date),
    fetchBlockedDatesForRange(params.delivery_date, params.return_date),
  ]);

  const relevantBookings = bookings.filter(
    (booking) =>
      booking.size_yards === sizeYards &&
      isActiveBookingStatus(booking.status) &&
      booking.id !== params.exclude_booking_id,
  );

  const dates = listDatesInRange(params.delivery_date, params.return_date);

  for (const date of dates) {
    const blockedForDate = blockedDates.filter(
      (blocked) => blocked.date === date,
    );
    const globalBlocked = blockedForDate.some(
      (blocked) => blocked.size_yards == null,
    );
    const sizeBlocked = blockedForDate.some(
      (blocked) => blocked.size_yards === sizeYards,
    );

    if (globalBlocked || sizeBlocked) {
      const reason =
        blockedForDate.find(
          (blocked) =>
            blocked.size_yards == null || blocked.size_yards === sizeYards,
        )?.reason || "This date is not available for booking.";

      return {
        bookable: false,
        reason: "date_blocked",
        message: reason,
        conflictingDate: date,
      };
    }

    const activeBookings = relevantBookings.filter((booking) =>
      bookingOccupiesDate(booking, date),
    ).length;

    if (activeBookings >= capacity) {
      return {
        bookable: false,
        reason: "no_capacity",
        message: `No units available for ${sizeYards}-yard dumpsters on ${date}.`,
        conflictingDate: date,
        capacity,
        activeBookings,
      };
    }
  }

  return {
    bookable: true,
    message: "Date and size are available.",
    capacity,
  };
}

export async function evaluateBlacklist(params: {
  phone?: string;
  email?: string;
  name?: string;
  address?: string;
}) {
  const blacklist = await fetchBlacklistEntries();
  const active = blacklist.filter((entry) => entry.is_active);

  const checks = [
    { type: "phone", value: params.phone || "" },
    { type: "email", value: params.email || "" },
    { type: "name", value: params.name || "" },
    { type: "address", value: params.address || "" },
  ] as const;

  const matched = active.find((entry) => {
    const check = checks.find((item) => item.type === entry.entry_type);
    if (!check || !check.value) return false;
    const normalized = normalizeBlacklistValue(entry.entry_type, check.value);
    return normalized.length > 0 && normalized === entry.normalized_value;
  });

  if (!matched) {
    return { blocked: false as const };
  }

  return {
    blocked: true as const,
    reason: matched.reason || "This contact is blocked from booking.",
    entryType: matched.entry_type,
  };
}
