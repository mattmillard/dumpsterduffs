import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getInventoryConfig } from "@/lib/admin/config";

export async function GET() {
  try {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    )
      .toISOString()
      .split("T")[0];

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const [{ data: allBookings, error }, inventory] = await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select(
          "id, customer_name, size_yards, delivery_date, return_date, total_price, status, payment_status, created_at",
        )
        .order("created_at", { ascending: false }),
      getInventoryConfig(),
    ]);

    if (error) {
      throw error;
    }

    const bookings = allBookings || [];

    const bookingsToday = bookings.filter(
      (booking) => booking.delivery_date === startOfToday,
    );
    const bookingsThisMonth = bookings.filter(
      (booking) => booking.delivery_date >= startOfMonth,
    );
    const pendingPayments = bookings.filter(
      (booking) =>
        booking.payment_status !== "paid" && booking.status !== "cancelled",
    ).length;
    const pendingDeliveries = bookings.filter(
      (booking) => booking.status === "scheduled",
    ).length;
    const completedPickups = bookings.filter(
      (booking) => booking.status === "completed",
    ).length;

    const revenueToday = bookingsToday.reduce(
      (sum, booking) => sum + Number(booking.total_price || 0),
      0,
    );
    const revenueThisMonth = bookingsThisMonth.reduce(
      (sum, booking) => sum + Number(booking.total_price || 0),
      0,
    );

    const availableDumpsters = inventory.reduce(
      (sum, item) => sum + Number(item.available_units || 0),
      0,
    );

    const recentBookings = bookings.slice(0, 6).map((booking) => ({
      booking_number: booking.id.slice(0, 8),
      customer: booking.customer_name,
      size: `${booking.size_yards} Yard`,
      delivery_date: booking.delivery_date,
      status: booking.status,
      total: Number(booking.total_price || 0),
    }));

    const alerts = bookings
      .filter(
        (booking) =>
          booking.payment_status !== "paid" && booking.status !== "cancelled",
      )
      .slice(0, 4)
      .map((booking) => ({
        id: booking.id,
        type: "warning",
        message: `Booking ${booking.id.slice(0, 8)} pending payment`,
        action: "View Booking",
        action_link: "/admin/bookings",
        dismissable: true,
      }));

    return NextResponse.json({
      metrics: {
        total_bookings_today: bookingsToday.length,
        total_bookings_this_month: bookingsThisMonth.length,
        pending_payments: pendingPayments,
        pending_deliveries: pendingDeliveries,
        completed_pickups: completedPickups,
        revenue_today: revenueToday,
        revenue_this_month: revenueThisMonth,
        available_dumpsters: availableDumpsters,
      },
      alerts,
      recentBookings,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 },
    );
  }
}
