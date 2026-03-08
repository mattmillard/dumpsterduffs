import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  checkBookingCapacity,
  isActiveBookingStatus,
} from "@/lib/admin/bookingOperations";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, customer_name, customer_phone, size_yards, delivery_date, return_date, total_price, status, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
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
