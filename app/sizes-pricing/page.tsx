import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dumpster Sizes & Pricing | Dumpster Duff's",
  description:
    "Transparent dumpster rental pricing in Missouri. Our 15-yard dumpster is $325 delivery + $5/day with no hidden fees. Same-day delivery in Columbia.",
};

export default function SizesPricing() {
  return (
    <div className="min-h-screen bg-secondary pt-24 pb-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Dumpster Sizes & Pricing
          </h1>
          <p className="text-xl text-white/70 mb-12">
            Simple, transparent pricing. No hidden fees. All-inclusive service.
          </p>

          {/* Pricing Card */}
          <div className="card p-8 bg-bg-alt mb-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  15-Yard Dumpster
                </h2>
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-white/70 mb-1">Dimensions</p>
                    <p className="text-lg font-semibold text-white">
                      16&apos; L × 8&apos; W × 4&apos; H
                    </p>
                  </div>
                  <div>
                    <p className="text-white/70 mb-1">Weight Limit</p>
                    <p className="text-lg font-semibold text-white">
                      Up to 2 tons included
                    </p>
                  </div>
                  <div>
                    <p className="text-white/70 mb-1">Rental Period</p>
                    <p className="text-lg font-semibold text-white">
                      Standard: 7 days (flexible options available)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="mb-8">
                  <p className="text-white/70 mb-2">Pricing Breakdown</p>
                  <div className="mb-4">
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-primary">
                        $325
                      </span>
                      <span className="text-white/70 ml-2">delivery fee</span>
                    </div>
                    <div>
                      <span className="text-4xl font-bold text-primary">
                        $5
                      </span>
                      <span className="text-white/70 ml-2">per day</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 mb-4">
                    ✓ Up to 2 tons included
                    <br />✓ $75 per ton over 2 tons
                    <br />✓ Same-day delivery in Columbia
                    <br />✓ No hidden fees
                  </p>
                </div>
                <a href="#book-now" className="btn-primary w-full text-center">
                  Book Now
                </a>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">
              What&apos;s Included in Your Rental?
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Delivery to your location",
                "Pickup when you're done",
                "Disposal of contents",
                "Up to 2 tons weight included",
                "Flexible rental periods",
                "Same-day delivery in Columbia",
                "Professional, courteous service",
                "Optional loading service (starting at $149)",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-bg-alt rounded-lg"
                >
                  <svg
                    className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
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
                  <span className="text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">Pricing FAQs</h3>
            <div className="space-y-4">
              {[
                {
                  q: "Are there any hidden fees?",
                  a: "No! Our price is all-inclusive. Delivery, pickup, disposal, and up to 2 tons of waste are all included in the quoted price.",
                },
                {
                  q: "What if I exceed the weight limit?",
                  a: "We allow up to 2 tons. If you go over, overage fees apply at $50 per ton. We'll let you know before charging any overage.",
                },
                {
                  q: "Can I keep the dumpster longer than 7 days?",
                  a: "Absolutely! Extended rentals are available. Just let us know, and we can extend your rental for a small daily fee (typically $15-25/day depending on your area).",
                },
                {
                  q: "Do you offer pickup/loading service?",
                  a: "Yes! We offer professional loading service for $149. Our team will load your dumpster for you.",
                },
              ].map((faq, idx) => (
                <details
                  key={idx}
                  className="card p-6 bg-bg-alt group cursor-pointer"
                >
                  <summary className="flex items-start justify-between list-none">
                    <h4 className="text-lg font-bold text-white pr-4 flex-1">
                      {faq.q}
                    </h4>
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 transform transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <p className="mt-4 text-white/70">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="card p-8 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/40 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to book your dumpster?
            </h3>
            <p className="text-white/70 mb-6">
              Same-day delivery in Columbia. Other areas may also qualify—call to confirm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#book-now" className="btn-primary">
                Book Now
              </a>
              <a href="tel:+15733564272" className="btn-secondary">
                Call: (573) 356-4272
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
