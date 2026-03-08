import { NextResponse } from "next/server";
import {
  checkBookingCapacity,
  evaluateBlacklist,
} from "@/lib/admin/bookingOperations";

type BookingCheckPayload = {
  delivery_date: string;
  pickup_date?: string;
  size_yards: number;
  customer_phone?: string;
  customer_email?: string;
  customer_name?: string;
  delivery_address_line_1?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingCheckPayload;

    if (!payload.delivery_date || !payload.size_yards) {
      return NextResponse.json(
        { error: "delivery_date and size_yards are required" },
        { status: 400 },
      );
    }

    // Check blacklist first
    const blacklistResult = await evaluateBlacklist({
      phone: payload.customer_phone,
      email: payload.customer_email,
      name: payload.customer_name,
      address: payload.delivery_address_line_1,
    });

    if (blacklistResult.blocked) {
      return NextResponse.json({
        bookable: false,
        reason: "blacklisted",
        message:
          blacklistResult.reason ||
          "We cannot accept bookings from this contact at this time.",
      });
    }

    const capacityCheck = await checkBookingCapacity({
      delivery_date: payload.delivery_date,
      return_date: payload.pickup_date || payload.delivery_date,
      size_yards: Number(payload.size_yards),
    });

    if (!capacityCheck.bookable) {
      return NextResponse.json({
        bookable: false,
        reason: capacityCheck.reason || "no_capacity",
        message: capacityCheck.message,
        conflictingDate: capacityCheck.conflictingDate,
        capacity: capacityCheck.capacity,
        activeBookings: capacityCheck.activeBookings,
      });
    }

    return NextResponse.json({
      bookable: true,
      message: "Date and size are available.",
    });
  } catch (error) {
    console.error("Booking check error:", error);
    return NextResponse.json(
      { error: "Failed to check booking availability" },
      { status: 500 },
    );
  }
}
