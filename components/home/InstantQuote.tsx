"use client";

import { useState } from "react";

export default function InstantQuote() {
  const [projectType, setProjectType] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [showEstimate, setShowEstimate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEstimate(true);
    // In production: integrate with Square Appointments API
  };

  return (
    <section id="book-now" className="section-padding bg-[#1A1A1A]">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get Your Price in 30 Seconds
            </h2>
            <p className="text-lg text-[#999999]">
              No hidden fees. Price locked at booking. Simple and transparent.
            </p>
          </div>

          {/* Quote Form */}
          <div className="card p-6 md:p-8 bg-gradient-to-br from-bg-alt to-secondary">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Project Type */}
                <div>
                  <label
                    htmlFor="project-type"
                    className="block text-sm font-semibold text-white mb-2"
                  >
                    What&apos;s your project?
                  </label>
                  <select
                    id="project-type"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select project type</option>
                    <option value="renovation">Home Renovation</option>
                    <option value="roofing">Roofing Project</option>
                    <option value="cleanout">Garage/Attic Cleanout</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="demolition">Demolition</option>
                    <option value="moving">Moving/Relocation</option>
                    <option value="construction">Construction</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* ZIP Code */}
                <div>
                  <label
                    htmlFor="zip-code"
                    className="block text-sm font-semibold text-white mb-2"
                  >
                    Your ZIP code
                  </label>
                  <input
                    id="zip-code"
                    type="text"
                    placeholder="e.g., 65201"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    pattern="[0-9]{5}"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label
                  htmlFor="details"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Additional details (optional)
                </label>
                <textarea
                  id="details"
                  rows={3}
                  placeholder="Tell us about your project, preferred delivery date, or request a loading estimate..."
                  className="input-field resize-none"
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-primary w-full text-lg">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Get Instant Quote & Book
              </button>
            </form>

            {/* Estimate Display */}
            {showEstimate && (
              <div className="mt-6 p-6 bg-[#262626] rounded-lg border-2 border-success">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Perfect! We can help.
                    </h3>
                    <p className="text-[#999999] mb-4">
                      Based on your project, we recommend our{" "}
                      <strong>15-yard dumpster</strong> (16&apos; x 4&apos;).
                    </p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold text-primary">
                        $325
                      </span>
                      <span className="text-[#808080]">+ $5/day</span>
                    </div>
                    <p className="text-sm text-[#808080] mb-4">
                      ✓ Includes delivery, pickup, and disposal
                      <br />
                      ✓ Same-day delivery in Columbia
                      <br />✓ Add loading service for $149
                    </p>
                    <a
                      href="https://square.site/book/YOUR_BOOKING_ID"
                      className="btn-primary inline-flex"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Complete Booking with Square
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Trust Line */}
            <p className="text-center text-sm text-[#808080] mt-6">
              🔒 Secure booking • No credit card required to get quote • Call us
              at{" "}
              <a href="tel:+15733564272" className="text-primary font-semibold">
                (573) 356-4272
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* WP MAPPING NOTES:
        - Form: Use Gravity Forms or WPForms with Square Appointments integration
        - Square integration: Use Square Appointments booking widget embed OR Zapier webhook
        - Conditional logic: Show estimate based on form submission
        - Store form data in CRM (could use Gravity Forms + Square webhook)
      */}
    </section>
  );
}
