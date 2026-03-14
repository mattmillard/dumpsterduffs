import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  checkBookingCapacity,
  isActiveBookingStatus,
} from "@/lib/admin/bookingOperations";

type ExistingBookingRow = {
  id: string;
  status: string;
  size_yards: number;
  delivery_date: string;
  return_date: string;
};

export async function GET() {
  try {
    // Try structured schema first (all address fields, return_date)
    const structuredQuery = await supabaseAdmin
      .from("bookings")
      .select(
        "id, customer_name, customer_email, customer_phone, size_yards, delivery_date, return_date, total_price, subtotal, delivery_fee, tax, status, payment_status, delivery_address_line_1, delivery_address_line_2, delivery_city, delivery_state, delivery_zip, placement_notes, created_at",
      )
      .order("created_at", { ascending: false });

    if (!structuredQuery.error) {
      return NextResponse.json(structuredQuery.data || []);
    }

    // Try legacy schema with return_date (single delivery_address field)
    const legacyReturnDateQuery = await supabaseAdmin
      .from("bookings")
      .select(
        "id, customer_name, customer_email, customer_phone, size_yards, delivery_date, return_date, total_price, status, payment_status, delivery_address, notes, created_at",
      )
      .order("created_at", { ascending: false });

    if (!legacyReturnDateQuery.error) {
      const legacyRows = (legacyReturnDateQuery.data || []) as Array<
        Record<string, unknown>
      >;
      const normalized = legacyRows.map((booking) => ({
        ...booking,
        subtotal: null,
        delivery_fee: null,
        tax: null,
        delivery_address_line_1:
          (booking.delivery_address as string | null) || null,
        delivery_address_line_2: null,
        delivery_city: null,
        delivery_state: null,
        delivery_zip: null,
        placement_notes: (booking.notes as string | null) || null,
      }));

      return NextResponse.json(normalized);
    }

    // Try legacy schema with pickup_date instead of return_date
    const legacyPickupDateQuery = await supabaseAdmin
      .from("bookings")
      .select(
        "id, customer_name, customer_email, customer_phone, size_yards, delivery_date, pickup_date, total_price, status, payment_status, delivery_address, notes, created_at",
      )
      .order("created_at", { ascending: false });

    if (!legacyPickupDateQuery.error) {
      const legacyRows = (legacyPickupDateQuery.data || []) as Array<
        Record<string, unknown>
      >;
      const normalized = legacyRows.map((booking) => ({
        ...booking,
        return_date: booking.pickup_date || null,
        subtotal: null,
        delivery_fee: null,
        tax: null,
        delivery_address_line_1:
          (booking.delivery_address as string | null) || null,
        delivery_address_line_2: null,
        delivery_city: null,
        delivery_state: null,
        delivery_zip: null,
        placement_notes: (booking.notes as string | null) || null,
      }));

      return NextResponse.json(normalized);
    }

    // Minimal fallback - absolute bare minimum fields
    const minimalQuery = await supabaseAdmin
      .from("bookings")
      .select(
        "id, customer_name, customer_phone, size_yards, delivery_date, total_price, status, created_at",
      )
      .order("created_at", { ascending: false });

    if (minimalQuery.error) {
      console.error("All booking queries failed. Last error:", minimalQuery.error);
      throw minimalQuery.error;
    }

    const minimalRows = (minimalQuery.data || []) as Array<
      Record<string, unknown>
    >;
    const minimalNormalized = minimalRows.map((booking) => ({
      ...booking,
      customer_email: null,
      return_date: null,
      payment_status: null,
      subtotal: null,
      delivery_fee: null,
      tax: null,
      delivery_address_line_1: null,
      delivery_address_line_2: null,
      delivery_city: null,
      delivery_state: null,
      delivery_zip: null,
      placement_notes: null,
    }));

    return NextResponse.json(minimalNormalized);
  } catch (error) {
    console.error("Bookings GET error:", error);
    return NextResponse.json(
      { error: "Failed to load bookings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = (await request.json()) as {
      id: string;
      status: string;
    };

    const { data: existingBooking, error: existingBookingError } =
      await supabaseAdmin
        .from("bookings")
        .select("id, status, size_yards, delivery_date, return_date")
        .eq("id", id)
        .single();

    if (existingBookingError) {
      throw existingBookingError;
    }

    const booking = existingBooking as ExistingBookingRow;

    const movingIntoActiveState =
      isActiveBookingStatus(status) && !isActiveBookingStatus(booking.status);

    if (movingIntoActiveState) {
      const capacityCheck = await checkBookingCapacity({
        delivery_date: booking.delivery_date,
        return_date: booking.return_date,
        size_yards: Number(booking.size_yards),
        exclude_booking_id: booking.id,
      });

      if (!capacityCheck.bookable) {
        return NextResponse.json(
          {
            error: capacityCheck.message,
            reason: capacityCheck.reason,
            conflictingDate: capacityCheck.conflictingDate,
            capacity: capacityCheck.capacity,
            activeBookings: capacityCheck.activeBookings,
          },
          { status: 409 },
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(
        "id, customer_name, customer_phone, size_yards, delivery_date, return_date, total_price, status, created_at",
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 },
    );
  }
}
