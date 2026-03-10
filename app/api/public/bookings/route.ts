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

    const bookingRecord = {
      customer_name: payload.customer_full_name,
      customer_email: payload.customer_email,
      customer_phone: payload.customer_phone,
      size_yards: payload.size_yards,
      delivery_address: fullAddress,
      delivery_date: payload.delivery_date,
      return_date: payload.pickup_date,
      total_price: payload.total,
      status: "pending",
      payment_status: "pending",
      notes: payload.placement_notes || null,
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

    // Try to send confirmation emails (optional - skip if env vars missing)
    let emailSent = false;
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.BOOKING_FROM_EMAIL;

      // Only try to send email if all required env vars are present
      if (resendApiKey && fromEmail && payload.customer_email) {
        const resend = new Resend(resendApiKey);

        // Enhanced customer confirmation email with deliverability headers
        const customerEmailHtml = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Booking Confirmation</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Booking Confirmed! ✓</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <p style="font-size: 16px; margin: 0 0 20px;">Hi ${payload.customer_full_name},</p>
                          <p style="font-size: 16px; margin: 0 0 30px;">Great news! Your dumpster rental booking has been confirmed and our team is preparing for your delivery.</p>
                          
                          <!-- Booking Details Card -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
                            <tr>
                              <td style="padding: 25px;">
                                <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px; font-weight: 600;">Booking Details</h2>
                                
                                <table width="100%" cellpadding="8" cellspacing="0">
                                  <tr>
                                    <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Booking Number:</td>
                                    <td style="color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${bookingNumber}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Dumpster Size:</td>
                                    <td style="color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${payload.size_yards} Yard</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Delivery Date:</td>
                                    <td style="color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${payload.delivery_date}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Pickup Date:</td>
                                    <td style="color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${payload.pickup_date}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #64748b; font-size: 14px; padding: 8px 0; vertical-align: top;">Delivery Address:</td>
                                    <td style="color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${fullAddress}</td>
                                  </tr>
                                  <tr>
                                    <td colspan="2" style="border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 10px;"></td>
                                  </tr>
                                  <tr>
                                    <td style="color: #1e293b; font-size: 16px; font-weight: 600; padding: 8px 0;">Total Price:</td>
                                    <td style="color: #2563eb; font-size: 18px; font-weight: 700; text-align: right; padding: 8px 0;">$${payload.total.toFixed(2)}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- What's Next Section -->
                          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                            <h3 style="color: #92400e; font-size: 16px; margin: 0 0 10px; font-weight: 600;">📋 What's Next?</h3>
                            <p style="color: #78350f; font-size: 14px; margin: 0; line-height: 1.6;">Our team will contact you within 24 hours to confirm delivery details and answer any questions. If you need immediate assistance, call us at <strong>(573) 356-4272</strong>.</p>
                          </div>
                          
                          <p style="font-size: 14px; color: #64748b; margin: 0;">Thank you for choosing Dumpster Duff's!</p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
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
            "Importance": "high",
            "X-Entity-Type": "transactional_receipt",
            "List-Unsubscribe": "<mailto:dustin@dumpsterduffs.com?subject=Unsubscribe>",
          },
        });

        if (customerResponse.error) {
          console.error("Customer email error:", customerResponse.error);
        } else {
          console.log("Customer email sent:", customerResponse.data?.id);
          emailSent = true;
        }

        // Send admin notification email
        const adminEmailHtml = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Booking Alert</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 20px 0;">
                <tr>
                  <td align="center">
                    <table width="650" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid #334155;">
                      <!-- Alert Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px 30px; border-radius: 12px 12px 0 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td>
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                                  🎉 New Booking Alert
                                </h1>
                                <p style="color: #d1fae5; margin: 5px 0 0; font-size: 14px;">Booking #${bookingNumber}</p>
                              </td>
                              <td align="right">
                                <div style="background-color: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block;">
                                  <span style="color: #ffffff; font-size: 20px; font-weight: 700;">$${payload.total.toFixed(2)}</span>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Main Content -->
                      <tr>
                        <td style="padding: 30px;">
                          <!-- Customer Information -->
                          <div style="background-color: #334155; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                            <h2 style="color: #93c5fd; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 15px; font-weight: 600;">Customer Details</h2>
                            <table width="100%" cellpadding="6" cellspacing="0">
                              <tr>
                                <td style="color: #94a3b8; font-size: 13px; width: 35%;">Name:</td>
                                <td style="color: #f1f5f9; font-size: 15px; font-weight: 600;">${payload.customer_full_name}</td>
                              </tr>
                              <tr>
                                <td style="color: #94a3b8; font-size: 13px;">Email:</td>
                                <td style="color: #3b82f6; font-size: 14px;"><a href="mailto:${payload.customer_email}" style="color: #3b82f6; text-decoration: none;">${payload.customer_email}</a></td>
                              </tr>
                              <tr>
                                <td style="color: #94a3b8; font-size: 13px;">Phone:</td>
                                <td style="color: #3b82f6; font-size: 14px;"><a href="tel:${payload.customer_phone}" style="color: #3b82f6; text-decoration: none;">${payload.customer_phone}</a></td>
                              </tr>
                              ${payload.customer_company ? `<tr>
                                <td style="color: #94a3b8; font-size: 13px;">Company:</td>
                                <td style="color: #f1f5f9; font-size: 14px;">${payload.customer_company}</td>
                              </tr>` : ''}
                            </table>
                          </div>
                          
                          <!-- Booking Details -->
                          <div style="background-color: #334155; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #8b5cf6;">
                            <h2 style="color: #c4b5fd; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 15px; font-weight: 600;">Booking Information</h2>
                            <table width="100%" cellpadding="6" cellspacing="0">
                              <tr>
                                <td style="color: #94a3b8; font-size: 13px; width: 35%;">Size:</td>
                                <td style="color: #f1f5f9; font-size: 15px; font-weight: 600;">${payload.size_yards} Yard Dumpster</td>
                              </tr>
                              <tr>
                                <td style="color: #94a3b8; font-size: 13px;">Delivery Date:</td>
                                <td style="color: #f1f5f9; font-size: 14px; font-weight: 600;">${payload.delivery_date}</td>
                              </tr>
                              <tr>
                                <td style="color: #94a3b8; font-size: 13px;">Pickup Date:</td>
                                <td style="color: #f1f5f9; font-size: 14px; font-weight: 600;">${payload.pickup_date}</td>
                              </tr>
                              <tr>
                                <td style="color: #94a3b8; font-size: 13px;">Duration:</td>
                                <td style="color: #f1f5f9; font-size: 14px;">${payload.rental_duration_days} days</td>
                              </tr>
                            </table>
                          </div>
                          
                          <!-- Delivery Address -->
                          <div style="background-color: #334155; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                            <h2 style="color: #fcd34d; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 15px; font-weight: 600;">Delivery Address</h2>
                            <p style="color: #f1f5f9; font-size: 15px; margin: 0; line-height: 1.6;">${fullAddress}</p>
                            ${payload.placement_notes ? `
                              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #475569;">
                                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 5px;">Placement Notes:</p>
                                <p style="color: #f1f5f9; font-size: 13px; margin: 0; font-style: italic;">"${payload.placement_notes}"</p>
                              </div>
                            ` : ''}
                          </div>
                          
                          <!-- Pricing Breakdown -->
                          <div style="background-color: #334155; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #10b981;">
                            <h2 style="color: #6ee7b7; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 15px; font-weight: 600;">Pricing</h2>
                            <table width="100%" cellpadding="6" cellspacing="0">
                              <tr>
                                <td style="color: #94a3b8; font-size: 13px;">Subtotal:</td>
                                <td style="color: #f1f5f9; font-size: 14px; text-align: right;">$${payload.subtotal.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td style="color: #94a3b8; font-size: 13px;">Delivery Fee:</td>
                                <td style="color: #f1f5f9; font-size: 14px; text-align: right;">$${payload.delivery_fee.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td style="color: #94a3b8; font-size: 13px;">Tax:</td>
                                <td style="color: #f1f5f9; font-size: 14px; text-align: right;">$${payload.tax.toFixed(2)}</td>
                              </tr>
                              <tr style="border-top: 2px solid #475569;">
                                <td style="color: #10b981; font-size: 16px; font-weight: 700; padding-top: 12px;">Total:</td>
                                <td style="color: #10b981; font-size: 18px; font-weight: 700; text-align: right; padding-top: 12px;">$${payload.total.toFixed(2)}</td>
                              </tr>
                            </table>
                          </div>
                          
                          <!-- Action Button -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" style="padding: 10px 0;">
                                <a href="https://dumpsterduffs.com/admin/bookings?id=${bookingId}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.4);">
                                  📊 View in Admin Panel
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #334155;">
                          <p style="color: #64748b; font-size: 12px; margin: 0;">Dumpster Duff's Admin System</p>
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
Phone:    ${payload.customer_phone}${payload.customer_company ? `\nCompany:  ${payload.customer_company}` : ''}

BOOKING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Size:          ${payload.size_yards} Yard Dumpster
Delivery:      ${payload.delivery_date}
Pickup:        ${payload.pickup_date}
Duration:      ${payload.rental_duration_days} days

DELIVERY ADDRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${fullAddress}${payload.placement_notes ? `\n\nPlacement Notes:\n"${payload.placement_notes}"` : ''}

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
          from: `"Dumpster Duff's Bookings" <${fromEmail}>`,
          to: "wantsomekarn@gmail.com",
          replyTo: payload.customer_email,
          subject: `🎉 New Booking: ${bookingNumber} - $${payload.total.toFixed(2)}`,
          html: adminEmailHtml,
          text: adminEmailText,
          headers: {
            "X-Priority": "1",
            "Importance": "high",
            "X-Entity-Type": "transactional",
            "List-Unsubscribe": "<mailto:dustin@dumpsterduffs.com?subject=Unsubscribe>",
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
    return NextResponse.json(
      { error: "Error processing checkout. Please try again." },
      { status: 500 },
    );
  }
}
