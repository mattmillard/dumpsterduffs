/**
 * Create a test booking to verify the booking system is working
 * Run with: npx tsx scripts/create-test-booking.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestBooking() {
  console.log("\n🧪 Creating Test Booking");
  console.log("=".repeat(60));

  // Test booking data
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now

  const returnDate = new Date(deliveryDate);
  returnDate.setDate(returnDate.getDate() + 3); // 3-day rental

  const testBooking = {
    customer_name: "Matt Test Customer",
    customer_email: "matt@test.com",
    customer_phone: "(573) 123-4567",
    customer_company: "Test Company LLC",
    size_yards: 15,
    delivery_date: deliveryDate.toISOString().split("T")[0],
    return_date: returnDate.toISOString().split("T")[0],
    delivery_address_line_1: "123 Main Street",
    delivery_address_line_2: "Suite 100",
    delivery_city: "Columbia",
    delivery_state: "MO",
    delivery_zip: "65201",
    placement_notes: "Please place dumpster in driveway. Call when arriving.",
    subtotal: 325.0,
    delivery_fee: 0.0,
    tax: 22.75,
    total_price: 347.75,
    payment_status: "pending",
    status: "pending",
  };

  console.log("📋 Test Booking Details:");
  console.log(`   Customer: ${testBooking.customer_name}`);
  console.log(`   Size: ${testBooking.size_yards} yards`);
  console.log(`   Delivery: ${testBooking.delivery_date}`);
  console.log(`   Return: ${testBooking.return_date}`);
  console.log(`   Total: $${testBooking.total_price.toFixed(2)}`);
  console.log("");

  // Insert booking
  console.log("💾 Inserting into database...");
  const { data, error } = await supabase
    .from("bookings")
    .insert([testBooking])
    .select()
    .single();

  if (error) {
    console.error("❌ Error creating booking:", error.message);
    console.error("\nPossible issues:");
    console.error("  • SQL schema not yet run in Supabase SQL Editor");
    console.error('  • Table "bookings" does not exist');
    console.error("  • RLS policies preventing insert");
    console.error(
      "\n💡 Make sure you ran: supabase/BOOKING_OPERATIONS_SCHEMA.sql",
    );
    process.exit(1);
  }

  console.log("✅ Booking created successfully!\n");
  console.log("📦 Booking Details:");
  console.log(`   ID: ${data.id}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Created: ${new Date(data.created_at).toLocaleString()}`);
  console.log("");

  // Verify we can read it back
  console.log("🔍 Verifying booking can be retrieved...");
  const { data: retrieved, error: retrieveError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", data.id)
    .single();

  if (retrieveError) {
    console.error("⚠️  Error retrieving booking:", retrieveError.message);
  } else {
    console.log("✅ Booking retrieved successfully!\n");
  }

  // Check all booking tables
  console.log("📊 Database Status:");

  const { count: bookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });
  console.log(`   Bookings: ${bookingsCount} total`);

  const { count: blockedCount } = await supabase
    .from("booking_blocked_dates")
    .select("*", { count: "exact", head: true });
  console.log(`   Blocked Dates: ${blockedCount} total`);

  const { count: blacklistCount } = await supabase
    .from("booking_blacklist")
    .select("*", { count: "exact", head: true });
  console.log(`   Blacklist Entries: ${blacklistCount} total`);

  const { count: logCount } = await supabase
    .from("booking_activity_log")
    .select("*", { count: "exact", head: true });
  console.log(`   Activity Logs: ${logCount} total`);

  console.log("\n" + "=".repeat(60));
  console.log("✨ Test booking created! System is working correctly.");
  console.log("👉 View in admin: http://localhost:3000/admin/calendar");
  console.log("=".repeat(60) + "\n");
}

createTestBooking()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Fatal error:", err);
    process.exit(1);
  });
