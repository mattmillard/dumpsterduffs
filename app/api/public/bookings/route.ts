import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Resend } from "resend";
import {
  checkBookingCapacity,
  evaluateBlacklist,
} from "@/lib/admin/bookingOperations";

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
  delivery_lat?: number;
  delivery_lng?: number;

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

function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateBookingPayload;

    console.log("Received booking payload:", JSON.stringify(payload, null, 2));

    const today = getLocalDateString();
    if (!payload.delivery_date || payload.delivery_date <= today) {
      return NextResponse.json(
        {
          error: "Delivery date must be in the future.",
          reason: "invalid_delivery_date",
        },
        { status: 400 },
      );
    }

    const blacklistResult = await evaluateBlacklist({
      phone: payload.customer_phone,
      email: payload.customer_email,
      name: payload.customer_full_name,
      address: payload.delivery_address_line_1,
    });

    if (blacklistResult.blocked) {
      return NextResponse.json(
        {
          error:
            blacklistResult.reason ||
            "We cannot accept bookings from this contact at this time.",
          reason: "blacklisted",
        },
        { status: 403 },
      );
    }

    const capacityCheck = await checkBookingCapacity({
      delivery_date: payload.delivery_date,
      return_date: payload.pickup_date,
      size_yards: Number(payload.size_yards),
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

    // Prepare booking record (match production schema)
    const addressLine2 = payload.delivery_address_line_2?.trim()
      ? ` ${payload.delivery_address_line_2}`
      : "";
    const fullAddress = `${payload.delivery_address_line_1}${addressLine2}, ${payload.delivery_city}, ${payload.delivery_state} ${payload.delivery_zip}`;

    const baseBookingFields = {
      customer_name: payload.customer_full_name,
      customer_email: payload.customer_email,
      customer_phone: payload.customer_phone,
      customer_company: payload.customer_company || null,
      size_yards: payload.size_yards,
      delivery_date: payload.delivery_date,
      total_price: payload.total,
      status: "pending",
      payment_status: "pending",
    };

    const structuredBookingRecord = {
      ...baseBookingFields,
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
    };

    // pickup_date variant: structured fields but uses pickup_date instead of return_date
    // Important: must NOT include return_date so the insert doesn't fail if that column is absent
    const structuredPickupDateRecord: Record<string, unknown> = {
      ...baseBookingFields,
      pickup_date: payload.pickup_date,
      delivery_address_line_1: payload.delivery_address_line_1,
      delivery_address_line_2: payload.delivery_address_line_2 || null,
      delivery_city: payload.delivery_city,
      delivery_state: payload.delivery_state,
      delivery_zip: payload.delivery_zip,
      placement_notes: payload.placement_notes || null,
      subtotal: payload.subtotal,
      delivery_fee: payload.delivery_fee,
      tax: payload.tax,
    };

    const legacyBookingRecord = {
      ...baseBookingFields,
      delivery_address: fullAddress,
      return_date: payload.pickup_date,
      notes: payload.placement_notes || null,
    };

    // pickup_date variant: legacy fields but uses pickup_date instead of return_date
    // Important: must NOT include return_date
    const legacyPickupDateRecord: Record<string, unknown> = {
      ...baseBookingFields,
      delivery_address: fullAddress,
      pickup_date: payload.pickup_date,
      notes: payload.placement_notes || null,
    };

    const insertAttempts: Array<{
      label: string;
      record: Record<string, unknown>;
    }> = [
      { label: "structured_return_date", record: structuredBookingRecord },
      { label: "structured_pickup_date", record: structuredPickupDateRecord },
      { label: "legacy_return_date", record: legacyBookingRecord },
      { label: "legacy_pickup_date", record: legacyPickupDateRecord },
    ];

    let bookingId: string | null = null;
    const insertErrors: Array<{
      label: string;
      code?: string;
      message?: string;
      details?: string;
    }> = [];

    for (const attempt of insertAttempts) {
      const attemptResult = await supabaseAdmin
        .from("bookings")
        .insert([attempt.record])
        .select("id")
        .single();

      if (!attemptResult.error && attemptResult.data?.id) {
        bookingId = String(attemptResult.data.id);
        break;
      }

      const maybeError = attemptResult.error as {
        code?: string;
        message?: string;
        details?: string;
      } | null;

      insertErrors.push({
        label: attempt.label,
        code: maybeError?.code,
        message: maybeError?.message,
        details: maybeError?.details,
      });
    }

    if (!bookingId) {
      console.error(
        "Booking insert attempts failed:",
        JSON.stringify(insertErrors, null, 2),
      );
      const firstError = insertErrors[0];
      const lastError = insertErrors[insertErrors.length - 1];
      const errorMessage =
        firstError?.message ||
        firstError?.details ||
        lastError?.message ||
        lastError?.details ||
        "Failed to create booking. Please contact support or try again.";

      return NextResponse.json(
        {
          error: errorMessage,
          reason: "booking_insert_failed",
          debug: insertErrors,
        },
        { status: 500 },
      );
    }

    const bookingNumber = bookingId.slice(0, 8).toUpperCase();

    // Try to send confirmation emails (optional - skip if env vars missing)
    let emailSent = false;
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.BOOKING_FROM_EMAIL;

      // Only try to send email if all required env vars are present
      if (resendApiKey && fromEmail && payload.customer_email) {
        const resend = new Resend(resendApiKey);

        // Enhanced customer confirmation email in dark mode
        const customerEmailHtml = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="color-scheme" content="dark only">
              <meta name="supported-color-schemes" content="dark">
              <title>Booking Confirmation</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e2e8f0; background-color: #0f172a !important;">
              <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0f172a" style="background-color: #0f172a; padding: 20px 0;">
                <tr>
                  <td align="center" bgcolor="#0f172a" style="background-color: #0f172a;">
                    <table width="600" cellpadding="0" cellspacing="0" bgcolor="#1e293b" style="background-color: #1e293b; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Booking Confirmed! ✓</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <p style="font-size: 16px; margin: 0 0 20px; color: #f1f5f9;">Hi ${payload.customer_full_name},</p>
                          <p style="font-size: 16px; margin: 0 0 30px; color: #e2e8f0;">Great news! Your dumpster rental booking has been confirmed and our team is preparing for your delivery.</p>
                          
                          <!-- Booking Details Card -->
                          <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#334155" style="background-color: #334155; border-radius: 6px; border: 1px solid #475569; margin-bottom: 30px;">
                            <tr>
                              <td style="padding: 25px;">
                                <h2 style="color: #93c5fd; font-size: 18px; margin: 0 0 20px; font-weight: 600;">Booking Details</h2>
                                
                                <table width="100%" cellpadding="8" cellspacing="0">
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Booking Number:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${bookingNumber}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Dumpster Size:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${payload.size_yards} Yard</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Delivery Date:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${payload.delivery_date}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Pickup Date:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${payload.pickup_date}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0; vertical-align: top;">Delivery Address:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${fullAddress}</td>
                                  </tr>
                                  <tr>
                                    <td colspan="2" style="border-top: 2px solid #475569; padding-top: 15px; margin-top: 10px;"></td>
                                  </tr>
                                  <tr>
                                    <td style="color: #f1f5f9; font-size: 16px; font-weight: 600; padding: 8px 0;">Total Price:</td>
                                    <td style="color: #60a5fa; font-size: 18px; font-weight: 700; text-align: right; padding: 8px 0;">$${payload.total.toFixed(2)}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- What's Next Section -->
                          <div style="background-color: #422006; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                            <h3 style="color: #fbbf24; font-size: 16px; margin: 0 0 10px; font-weight: 600;">📋 What's Next?</h3>
                            <p style="color: #fde68a; font-size: 14px; margin: 0; line-height: 1.6;">Our team will contact you within 24 hours to confirm delivery details and answer any questions. If you need immediate assistance, call us at <strong>(573) 356-4272</strong>.</p>
                          </div>
                          
                          <p style="font-size: 14px; color: #94a3b8; margin: 0;">Thank you for choosing Dumpster Duff's!</p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td bgcolor="#0f172a" style="background-color: #0f172a; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #475569;">
                          <p style="color: #64748b; font-size: 12px; margin: 0 0 5px;">Dumpster Duff's</p>
                          <p style="color: #64748b; font-size: 12px; margin: 0;">(573) 356-4272 | dustin@dumpsterduffs.com</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `;

        const customerEmailText = `
BOOKING CONFIRMED ✓

Hi ${payload.customer_full_name},

Great news! Your dumpster rental booking has been confirmed and our team is preparing for your delivery.

BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking Number:      ${bookingNumber}
Dumpster Size:       ${payload.size_yards} Yard
Delivery Date:       ${payload.delivery_date}
Pickup Date:         ${payload.pickup_date}
Delivery Address:    ${fullAddress}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Price:         $${payload.total.toFixed(2)}

WHAT'S NEXT?
Our team will contact you within 24 hours to confirm delivery details and answer any questions. If you need immediate assistance, call us at (573) 356-4272.

Thank you for choosing Dumpster Duff's!

Dumpster Duff's
(573) 356-4272 | dustin@dumpsterduffs.com
        `.trim();

        // Send customer confirmation
        const customerResponse = await resend.emails.send({
          from: `"Dumpster Duff's" <${fromEmail}>`,
          to: payload.customer_email,
          replyTo: "dustin@dumpsterduffs.com",
          subject: `✓ Booking Confirmed: ${bookingNumber}`,
          html: customerEmailHtml,
          text: customerEmailText,
          headers: {
            "X-Priority": "1",
            Importance: "high",
            "X-Entity-Type": "transactional_receipt",
          },
        });

        if (customerResponse.error) {
          console.error("Customer email error:", customerResponse.error);
        } else {
          console.log("Customer email sent:", customerResponse.data?.id);
          emailSent = true;
        }

        // Send admin notification email in dark mode matching customer design
        const adminEmailHtml = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="color-scheme" content="dark only">
              <meta name="supported-color-schemes" content="dark">
              <title>New Booking Notification</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e2e8f0; background-color: #0f172a !important;">
              <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0f172a" style="background-color: #0f172a; padding: 20px 0;">
                <tr>
                  <td align="center" bgcolor="#0f172a" style="background-color: #0f172a;">
                    <table width="600" cellpadding="0" cellspacing="0" bgcolor="#1e293b" style="background-color: #1e293b; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">New Booking Received</h1>
                          <p style="color: #dbeafe; margin: 8px 0 0; font-size: 14px;">Booking #${bookingNumber} - $${payload.total.toFixed(2)}</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <!-- Customer Information -->
                          <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#334155" style="background-color: #334155; border-radius: 6px; border: 1px solid #475569; margin-bottom: 25px;">
                            <tr>
                              <td style="padding: 25px;">
                                <h2 style="color: #93c5fd; font-size: 18px; margin: 0 0 20px; font-weight: 600;">Customer Information</h2>
                                <table width="100%" cellpadding="8" cellspacing="0">
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0; width: 35%;">Name:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${payload.customer_full_name}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Email:</td>
                                    <td style="color: #60a5fa; font-size: 14px; text-align: right; padding: 8px 0;"><a href="mailto:${payload.customer_email}" style="color: #60a5fa; text-decoration: none;">${payload.customer_email}</a></td>
                                  </tr>
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Phone:</td>
                                    <td style="color: #60a5fa; font-size: 14px; text-align: right; padding: 8px 0;"><a href="tel:${payload.customer_phone}" style="color: #60a5fa; text-decoration: none;">${payload.customer_phone}</a></td>
                                  </tr>
                                  ${
                                    payload.customer_company
                                      ? `<tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Company:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; text-align: right; padding: 8px 0;">${payload.customer_company}</td>
                                  </tr>`
                                      : ""
                                  }
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Booking Details -->
                          <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#334155" style="background-color: #334155; border-radius: 6px; border: 1px solid #475569; margin-bottom: 25px;">
                            <tr>
                              <td style="padding: 25px;">
                                <h2 style="color: #93c5fd; font-size: 18px; margin: 0 0 20px; font-weight: 600;">Booking Details</h2>
                                <table width="100%" cellpadding="8" cellspacing="0">
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0; width: 35%;">Size:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${payload.size_yards} Yard Dumpster</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Delivery Date:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${payload.delivery_date}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Pickup Date:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${payload.pickup_date}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Duration:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; text-align: right; padding: 8px 0;">${payload.rental_duration_days} days</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Delivery Address -->
                          <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#334155" style="background-color: #334155; border-radius: 6px; border: 1px solid #475569; margin-bottom: 25px;">
                            <tr>
                              <td style="padding: 25px;">
                                <h2 style="color: #93c5fd; font-size: 18px; margin: 0 0 10px; font-weight: 600;">Delivery Address</h2>
                                <p style="color: #f1f5f9; font-size: 15px; margin: 0; line-height: 1.6;">${fullAddress}</p>
                                ${
                                  payload.placement_notes
                                    ? `
                                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #475569;">
                                    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 5px; font-weight: 600;">Placement Notes:</p>
                                    <p style="color: #f1f5f9; font-size: 13px; margin: 0; font-style: italic;">"${payload.placement_notes}"</p>
                                  </div>
                                `
                                    : ""
                                }
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Pricing -->
                          <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#334155" style="background-color: #334155; border-radius: 6px; border: 1px solid #475569; margin-bottom: 30px;">
                            <tr>
                              <td style="padding: 25px;">
                                <h2 style="color: #93c5fd; font-size: 18px; margin: 0 0 20px; font-weight: 600;">Pricing</h2>
                                <table width="100%" cellpadding="8" cellspacing="0">
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Subtotal:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; text-align: right; padding: 8px 0;">$${payload.subtotal.toFixed(2)}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Delivery Fee:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; text-align: right; padding: 8px 0;">$${payload.delivery_fee.toFixed(2)}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0;">Tax:</td>
                                    <td style="color: #f1f5f9; font-size: 14px; text-align: right; padding: 8px 0;">$${payload.tax.toFixed(2)}</td>
                                  </tr>
                                  <tr>
                                    <td colspan="2" style="border-top: 2px solid #475569; padding-top: 15px; margin-top: 10px;"></td>
                                  </tr>
                                  <tr>
                                    <td style="color: #f1f5f9; font-size: 16px; font-weight: 600; padding: 8px 0;">Total Price:</td>
                                    <td style="color: #60a5fa; font-size: 18px; font-weight: 700; text-align: right; padding: 8px 0;">$${payload.total.toFixed(2)}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Action Button -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" style="padding: 10px 0;">
                                <a href="https://dumpsterduffs.com/admin/bookings?id=${bookingId}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.4);">View in Admin Panel</a>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="font-size: 14px; color: #94a3b8; margin: 20px 0 0; text-align: center;">Customer contact information available above</p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td bgcolor="#0f172a" style="background-color: #0f172a; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #475569;">
                          <p style="color: #64748b; font-size: 12px; margin: 0 0 5px;">Dumpster Duff's</p>
                          <p style="color: #64748b; font-size: 12px; margin: 0;">(573) 356-4272 | dustin@dumpsterduffs.com</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `;

        const adminEmailText = `
🎉 NEW BOOKING ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking Number: ${bookingNumber}
Total: $${payload.total.toFixed(2)}

CUSTOMER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:     ${payload.customer_full_name}
Email:    ${payload.customer_email}
Phone:    ${payload.customer_phone}${payload.customer_company ? `\nCompany:  ${payload.customer_company}` : ""}

BOOKING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Size:          ${payload.size_yards} Yard Dumpster
Delivery:      ${payload.delivery_date}
Pickup:        ${payload.pickup_date}
Duration:      ${payload.rental_duration_days} days

DELIVERY ADDRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${fullAddress}${payload.placement_notes ? `\n\nPlacement Notes:\n"${payload.placement_notes}"` : ""}

PRICING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal:      $${payload.subtotal.toFixed(2)}
Delivery Fee:  $${payload.delivery_fee.toFixed(2)}
Tax:           $${payload.tax.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:         $${payload.total.toFixed(2)}

View in Admin Panel:
https://dumpsterduffs.com/admin/bookings?id=${bookingId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dumpster Duff's Admin System
        `.trim();

        const adminResponse = await resend.emails.send({
          from: `"Dumpster Duff's" <${fromEmail}>`,
          to: "dustin@dumpsterduffs.com",
          replyTo: "dustin@dumpsterduffs.com",
          subject: `New Booking Notification: ${bookingNumber}`,
          html: adminEmailHtml,
          text: adminEmailText,
          headers: {
            "X-Priority": "1",
            Importance: "high",
            "X-Entity-Type": "transactional",
          },
        });

        if (adminResponse.error) {
          console.error("Admin email error:", adminResponse.error);
        } else {
          console.log("Admin email sent:", adminResponse.data?.id);
        }
      } else {
        console.log(
          "Email skipped - missing config. ApiKey:",
          !!resendApiKey,
          "FromEmail:",
          !!fromEmail,
          "CustomerEmail:",
          !!payload.customer_email,
        );
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

    const maybeError = error as {
      message?: string;
      details?: string;
      hint?: string;
    };

    const errorMessage =
      maybeError?.message ||
      maybeError?.details ||
      maybeError?.hint ||
      "Error processing checkout. Please try again.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
