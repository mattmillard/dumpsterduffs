import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Resend } from "resend";

type CreateBookingPayload = {
  // Size
  dumpster_size_id: string;
  size_yards: number;

  // Dates
  delivery_date: string; // YYYY-MM-DD
  pickup_date: string; // YYYY-MM-DD
  rental_duration_days: number;

  // Address
  delivery_address_line_1: string;
  delivery_address_line_2?: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip: string;

  // Customer info
  customer_full_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company?: string;

  // Notes
  placement_notes?: string;

  // Pricing
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateBookingPayload;

    console.log("Received booking payload:", JSON.stringify(payload, null, 2));

    // Prepare booking record
    const bookingRecord = {
      customer_name: payload.customer_full_name,
      customer_email: payload.customer_email || null,
      customer_phone: payload.customer_phone,
      customer_company: payload.customer_company || null,
      size_yards: payload.size_yards,
      delivery_date: payload.delivery_date,
      return_date: payload.pickup_date,
      delivery_address_line_1: payload.delivery_address_line_1,
      delivery_address_line_2: payload.delivery_address_line_2 || null,
      delivery_city: payload.delivery_city,
      delivery_state: payload.delivery_state,
      delivery_zip: payload.delivery_zip,
      placement_notes: payload.placement_notes || null,
      subtotal: payload.subtotal,
      delivery_fee: payload.delivery_fee,
      tax: payload.tax,
      total_price: payload.total,
      payment_status: "pending",
      status: "pending",
    };

    // Insert booking into database
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert([bookingRecord])
      .select("id")
      .single();

    if (error) {
      console.error("Booking insert error:", JSON.stringify(error, null, 2));
      console.error("Booking record:", JSON.stringify(bookingRecord, null, 2));
      return NextResponse.json(
        { error: "Failed to create booking. Please try again." },
        { status: 500 },
      );
    }

    const bookingId = data.id;
    const bookingNumber = bookingId.slice(0, 8).toUpperCase();

    // Try to send confirmation email (optional)
    let emailSent = false;
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.BOOKING_FROM_EMAIL;

      if (resendApiKey && fromEmail && payload.customer_email) {
        const resend = new Resend(resendApiKey);
        
        const emailHtml = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2>Booking Confirmation</h2>
              <p>Hi ${payload.customer_full_name},</p>
              <p>Your dumpster rental booking has been confirmed!</p>
              
              <h3>Booking Details</h3>
              <ul>
                <li><strong>Booking Number:</strong> ${bookingNumber}</li>
                <li><strong>Dumpster Size:</strong> ${payload.size_yards} Yard</li>
                <li><strong>Delivery Date:</strong> ${payload.delivery_date}</li>
                <li><strong>Pickup Date:</strong> ${payload.pickup_date}</li>
                <li><strong>Delivery Address:</strong> ${payload.delivery_address_line_1}, ${payload.delivery_city}, ${payload.delivery_state} ${payload.delivery_zip}</li>
                <li><strong>Total Price:</strong> $${payload.total.toFixed(2)}</li>
              </ul>
              
              <h3>What's Next?</h3>
              <p>Our team will contact you to confirm delivery details. You can reach us at (573) 356-4272.</p>
              
              <p>Thank you for choosing Dumpster Duff's!</p>
            </body>
          </html>
        `;

        const response = await resend.emails.send({
          from: fromEmail,
          to: payload.customer_email,
          subject: `Booking Confirmed: ${bookingNumber}`,
          html: emailHtml,
        });

        if (response.error) {
          console.error("Resend email error:", response.error);
        } else {
          console.log("Email sent successfully:", response.data?.id);
          emailSent = true;
        }
      }
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      bookingId,
      bookingNumber,
      emailSent,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Error processing checkout. Please try again." },
      { status: 500 },
    );
  }
}
