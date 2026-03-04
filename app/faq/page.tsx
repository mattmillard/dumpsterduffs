import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Dumpster Duff's",
  description:
    "Frequently asked questions about dumpster rental in Missouri. Find answers to your dumpster rental questions.",
};

export default function FAQ() {
  const categories = [
    {
      title: "Pricing & Booking",
      faqs: [
        {
          q: "How much does a dumpster rental cost?",
          a: "Our 15-yard dumpster rental is $325 delivery + $5 per day. This includes up to 2 tons of disposal. Each additional ton over 2 tons is $75. Completely transparent pricing.",
        },
        {
          q: "Are there any hidden fees?",
          a: "No! Our price is all-inclusive. Delivery, pickup, disposal, and up to 2 tons are included. The only additional fee would be overage charges if you exceed the weight limit.",
        },
        {
          q: "Can I extend my rental?",
          a: "Yes! Extended rentals are available. Just call us before your scheduled pickup date, and we can extend it for a small daily fee (~$15-25/day).",
        },
        {
          q: "How do I book?",
          a: "Book online using our form or call (573) 356-4272. Both methods take just a few minutes.",
        },
      ],
    },
    {
      title: "Delivery & Logistics",
      faqs: [
        {
          q: "Is same-day delivery available?",
          a: "Yes! Same-day delivery is available for most orders in our service area. Delivery usually happens within 2-4 hours.",
        },
        {
          q: "What if I need delivery on a specific date?",
          a: "Let us know your preferred date when booking, and we'll do our best to accommodate. Same-day delivery is often available.",
        },
        {
          q: "What are your service areas?",
          a: "We serve Columbia, Jefferson City, Fulton, Moberly, and surrounding areas in central Missouri. View our full service area list.",
        },
        {
          q: "Can I change my pickup date?",
          a: "Yes! Just call us before your scheduled pickup, and we can reschedule at no additional cost.",
        },
      ],
    },
    {
      title: "What Can Go In",
      faqs: [
        {
          q: "What can I put in the dumpster?",
          a: "You can put most household junk, construction debris, furniture, appliances, and yard waste. Avoid hazardous materials, chemicals, paint, tires, batteries, and electronics.",
        },
        {
          q: "Can I put drywall in the dumpster?",
          a: "Yes, drywall is accepted. However, there may be a small additional fee if it exceeds your weight limit.",
        },
        {
          q: "What about oversized items?",
          a: "Most oversized items like furniture and appliances are fine. Just make sure they fit in the dumpster opening.",
        },
        {
          q: "Is yard waste okay?",
          a: "Yes! Yard waste, leaves, branches, and grass clippings are all acceptable.",
        },
      ],
    },
    {
      title: "General Questions",
      faqs: [
        {
          q: "Do I need a permit?",
          a: "If the dumpster is on your private property (driveway, yard), usually no permit is needed. If it's on the street or public property, check with your city—you may need a permit.",
        },
        {
          q: "How long is the standard rental?",
          a: "Standard rental is 7 days, but flexible periods are available. Extend it as long as you need.",
        },
        {
          q: "What if I exceed the weight limit?",
          a: "We include up to 2 tons. If you go over, overage fees apply ($50 per ton). We'll notify you before charging any overage.",
        },
        {
          q: "Do you offer loading service?",
          a: "Yes! Professional loading service is available for $149. Our team will load your dumpster for you.",
        },
        {
          q: "Are you a veteran-owned business?",
          a: "Yes! We're proudly veteran-owned and committed to serving central Missouri with excellence.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-secondary pt-24 pb-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-white/70 mb-12">
            Find answers to common questions about dumpster rental.
          </p>

          {/* FAQ Categories */}
          <div className="space-y-12">
            {categories.map((category, cidx) => (
              <div key={cidx} className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {category.title}
                </h2>
                <div className="space-y-4">
                  {category.faqs.map((faq, fidx) => (
                    <details
                      key={fidx}
                      className="card p-6 bg-bg-alt group cursor-pointer"
                    >
                      <summary className="flex items-start justify-between list-none">
                        <h3 className="text-lg font-bold text-white pr-4 flex-1">
                          {faq.q}
                        </h3>
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
                      <p className="mt-4 text-white/80">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="card p-8 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/40 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-white/70 mb-6">
              Get in touch with our team anytime. We&apos;re happy to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn-secondary">
                Contact Us
              </a>
              <a href="tel:+15733564272" className="btn-primary">
                Call: (573) 356-4272
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
