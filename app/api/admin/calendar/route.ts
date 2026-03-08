import { NextResponse } from "next/server";
import {
  addBlacklistEntry,
  BookingCapacityError,
  blockDate,
  cancelBooking,
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
    };

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
            payload.size_yards == null ? null : Number(payload.size_yards),
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
        error:
          error instanceof Error
            ? error.message
            : "Failed to process calendar action",
      },
      { status: 500 },
    );
  }
}
