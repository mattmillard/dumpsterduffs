import { NextResponse } from "next/server";
import {
  addBlacklistEntry,
  BookingCapacityError,
  blockDate,
  cancelBooking,
  confirmInternalReservationPickup,
  createInternalReservation,
  freeDate,
  getCalendarSnapshot,
  restoreBooking,
  toggleBlacklistEntry,
} from "@/lib/admin/bookingOperations";

type CalendarActionPayload =
  | {
      action: "block_date";
      date: string;
      size_yards?: number | null;
      reason?: string;
    }
  | {
      action: "free_date";
      id?: string;
      date?: string;
      size_yards?: number | null;
    }
  | {
      action: "cancel_booking";
      booking_id: string;
      reason?: string;
    }
  | {
      action: "restore_booking";
      booking_id: string;
    }
  | {
      action: "blacklist_add";
      entry_type: "phone" | "email" | "name" | "address";
      value: string;
      reason?: string;
    }
  | {
      action: "blacklist_toggle";
      id: string;
      is_active: boolean;
    }
  | {
      action: "reserve_dumpster";
      size_yards: number;
      start_date: string;
      pickup_date: string;
      pickup_time_slot?: "AM" | "PM";
      notes?: string;
    }
  | {
      action: "reservation_pickup_outcome";
      id: string;
      outcome: "picked_up" | "pickup_missed";
      pickup_date?: string;
      pickup_notes?: string;
    };

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
    };

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }

    if (typeof maybeError.details === "string" && maybeError.details.trim()) {
      return maybeError.details;
    }

    if (typeof maybeError.hint === "string" && maybeError.hint.trim()) {
      return maybeError.hint;
    }
  }

  return "Failed to process calendar action";
}

function getMonthParam(request: Request) {
  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");
  const now = new Date();
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
    return currentMonth;
  }

  return monthParam;
}

export async function GET(request: Request) {
  try {
    const month = getMonthParam(request);
    const snapshot = await getCalendarSnapshot(month);
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load calendar operations" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CalendarActionPayload;

    switch (payload.action) {
      case "block_date": {
        if (!payload.date) {
          return NextResponse.json(
            { error: "date is required" },
            { status: 400 },
          );
        }

        await blockDate({
          date: payload.date,
          size_yards:
            payload.size_yards == null ? null : Number(payload.size_yards),
          reason: payload.reason,
        });
        break;
      }

      case "free_date": {
        await freeDate({
          id: payload.id,
          date: payload.date,
          size_yards:
            payload.size_yards === undefined
              ? undefined
              : payload.size_yards === null
                ? null
                : Number(payload.size_yards),
        });
        break;
      }

      case "cancel_booking": {
        if (!payload.booking_id) {
          return NextResponse.json(
            { error: "booking_id is required" },
            { status: 400 },
          );
        }

        await cancelBooking(payload.booking_id, payload.reason);
        break;
      }

      case "restore_booking": {
        if (!payload.booking_id) {
          return NextResponse.json(
            { error: "booking_id is required" },
            { status: 400 },
          );
        }

        await restoreBooking(payload.booking_id);
        break;
      }

      case "blacklist_add": {
        if (!payload.entry_type || !payload.value?.trim()) {
          return NextResponse.json(
            { error: "entry_type and value are required" },
            { status: 400 },
          );
        }

        await addBlacklistEntry({
          entry_type: payload.entry_type,
          value: payload.value.trim(),
          reason: payload.reason,
        });
        break;
      }

      case "blacklist_toggle": {
        if (!payload.id) {
          return NextResponse.json(
            { error: "id is required" },
            { status: 400 },
          );
        }

        await toggleBlacklistEntry(payload.id, Boolean(payload.is_active));
        break;
      }

      case "reserve_dumpster": {
        if (
          !payload.size_yards ||
          !payload.start_date ||
          !payload.pickup_date
        ) {
          return NextResponse.json(
            { error: "size_yards, start_date, and pickup_date are required" },
            { status: 400 },
          );
        }

        await createInternalReservation({
          size_yards: Number(payload.size_yards),
          start_date: payload.start_date,
          pickup_date: payload.pickup_date,
          pickup_time_slot: payload.pickup_time_slot,
          notes: payload.notes,
        });
        break;
      }

      case "reservation_pickup_outcome": {
        if (!payload.id || !payload.outcome) {
          return NextResponse.json(
            { error: "id and outcome are required" },
            { status: 400 },
          );
        }

        await confirmInternalReservationPickup({
          id: payload.id,
          outcome: payload.outcome,
          pickup_date: payload.pickup_date,
          pickup_notes: payload.pickup_notes,
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const month = getMonthParam(request);
    const snapshot = await getCalendarSnapshot(month);
    return NextResponse.json(snapshot);
  } catch (error) {
    if (error instanceof BookingCapacityError) {
      return NextResponse.json(
        {
          error: error.message,
          reason: error.reason,
          conflictingDate: error.conflictingDate,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
