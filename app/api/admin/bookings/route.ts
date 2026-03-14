import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  checkBookingCapacity,
  isActiveBookingStatus,
} from "@/lib/admin/bookingOperations";

export async function GET() {
  try {
    const structuredQuery = await supabaseAdmin
      .from("bookings")
      .select(
        "id, customer_name, customer_email, customer_phone, customer_company, size_yards, delivery_date, return_date, total_price, subtotal, delivery_fee, tax, status, payment_status, delivery_address_line_1, delivery_address_line_2, delivery_city, delivery_state, delivery_zip, placement_notes, created_at",
      )
      .order("created_at", { ascending: false });

    if (!structuredQuery.error) {
      return NextResponse.json(structuredQuery.data || []);
    }

    const legacyQuery = await supabaseAdmin
      .from("bookings")
      .select(
        "id, customer_name, customer_email, customer_phone, customer_company, size_yards, delivery_date, return_date, total_price, status, payment_status, delivery_address, notes, created_at",
      )
      .order("created_at", { ascending: false });

    if (legacyQuery.error) {
      throw legacyQuery.error;
    }

    const normalized = (legacyQuery.data || []).map((booking) => ({
      ...booking,
      subtotal: null,
      delivery_fee: null,
      tax: null,
      delivery_address_line_1: booking.delivery_address || null,
      delivery_address_line_2: null,
      delivery_city: null,
      delivery_state: null,
      delivery_zip: null,
      placement_notes: booking.notes || null,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
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

    const movingIntoActiveState =
      isActiveBookingStatus(status) &&
      !isActiveBookingStatus(existingBooking.status);

    if (movingIntoActiveState) {
      const capacityCheck = await checkBookingCapacity({
        delivery_date: existingBooking.delivery_date,
        return_date: existingBooking.return_date,
        size_yards: Number(existingBooking.size_yards),
        exclude_booking_id: existingBooking.id,
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
