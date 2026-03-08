/**
 * Create 3 sample bookings in Supabase
 * Run with: node scripts/create-sample-bookings.js
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=#]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSampleBookings() {
  console.log("\n📦 Creating 3 Sample Bookings");
  console.log("=".repeat(60));

  const today = new Date();

  // Booking 1: 3 days from now, 3-day rental
  const booking1DeliveryDate = new Date(today);
  booking1DeliveryDate.setDate(today.getDate() + 3);
  const booking1ReturnDate = new Date(booking1DeliveryDate);
  booking1ReturnDate.setDate(booking1DeliveryDate.getDate() + 3);

  // Booking 2: 14 days from now, 5-day rental
  const booking2DeliveryDate = new Date(today);
  booking2DeliveryDate.setDate(today.getDate() + 14);
  const booking2ReturnDate = new Date(booking2DeliveryDate);
  booking2ReturnDate.setDate(booking2DeliveryDate.getDate() + 5);

  // Booking 3: 21 days from now, 7-day rental
  const booking3DeliveryDate = new Date(today);
  booking3DeliveryDate.setDate(today.getDate() + 21);
  const booking3ReturnDate = new Date(booking3DeliveryDate);
  booking3ReturnDate.setDate(booking3DeliveryDate.getDate() + 7);

  const sampleBookings = [
    {
      customer_name: "John Smith",
      customer_email: "john.smith@example.com",
      customer_phone: "(573) 555-0101",
      customer_company: "Smith Construction LLC",
      size_yards: 15,
      delivery_date: booking1DeliveryDate.toISOString().split("T")[0],
      return_date: booking1ReturnDate.toISOString().split("T")[0],
      delivery_address_line_1: "123 Main Street",
      delivery_address_line_2: "",
      delivery_city: "Columbia",
      delivery_state: "MO",
      delivery_zip: "65201",
      placement_notes: "Please place in driveway. Call before delivery.",
      subtotal: 325.0,
      delivery_fee: 0.0,
      tax: 0.0,
      total_price: 325.0,
      payment_status: "pending",
      status: "pending",
    },
    {
      customer_name: "Sarah Johnson",
      customer_email: "sarah.j@example.com",
      customer_phone: "(573) 555-0202",
      customer_company: null,
      size_yards: 15,
      delivery_date: booking2DeliveryDate.toISOString().split("T")[0],
      return_date: booking2ReturnDate.toISOString().split("T")[0],
      delivery_address_line_1: "456 Oak Avenue",
      delivery_address_line_2: "Apt 2B",
      delivery_city: "Jefferson City",
      delivery_state: "MO",
      delivery_zip: "65101",
      placement_notes: "Behind the garage, accessible from alley.",
      subtotal: 335.0,
      delivery_fee: 0.0,
      tax: 0.0,
      total_price: 335.0,
      payment_status: "paid",
      status: "scheduled",
    },
    {
      customer_name: "Michael Davis",
      customer_email: "mdavis@example.com",
      customer_phone: "(573) 555-0303",
      customer_company: "Davis Roofing Services",
      size_yards: 15,
      delivery_date: booking3DeliveryDate.toISOString().split("T")[0],
      return_date: booking3ReturnDate.toISOString().split("T")[0],
      delivery_address_line_1: "789 Elm Street",
      delivery_address_line_2: "",
      delivery_city: "Columbia",
      delivery_state: "MO",
      delivery_zip: "65203",
      placement_notes: "Driveway on left side of house.",
      subtotal: 345.0,
      delivery_fee: 0.0,
      tax: 0.0,
      total_price: 345.0,
      payment_status: "paid",
      status: "scheduled",
    },
  ];

  let successCount = 0;

  for (let i = 0; i < sampleBookings.length; i++) {
    const booking = sampleBookings[i];
    console.log(
      `\n[${i + 1}/3] Creating booking for ${booking.customer_name}...`,
    );
    console.log(`   📅 Delivery: ${booking.delivery_date}`);
    console.log(`   📦 Size: ${booking.size_yards} yards`);
    console.log(`   💰 Total: $${booking.total_price.toFixed(2)}`);

    const { data, error } = await supabase
      .from("bookings")
      .insert([booking])
      .select()
      .single();

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
    } else {
      console.log(`   ✅ Created with ID: ${data.id}`);
      successCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Successfully created ${successCount}/3 bookings`);

  if (successCount < 3) {
    console.log("\n⚠️  Some bookings failed to create.");
    console.log(
      "Make sure you ran the SQL schema: supabase/BOOKING_OPERATIONS_SCHEMA.sql",
    );
  } else {
    console.log("\n🎉 All bookings created successfully!");
    console.log("👉 View them at: http://localhost:3000/admin/calendar");
  }

  console.log("=".repeat(60) + "\n");
}

createSampleBookings()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Fatal error:", err);
    process.exit(1);
  });
