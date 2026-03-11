import { Metadata } from "next";
import { getLivePricingSnapshot } from "@/lib/utils/sitePricing";

export const metadata: Metadata = {
  title: "FAQ | Dumpster Duff's",
  description:
    "FAQs about dumpster rental and professional junk removal in Missouri. Find answers to your questions.",
};

export default async function FAQ() {
  const pricing = await getLivePricingSnapshot();

  const categories = [
    {
      title: "Pricing & Booking",
      faqs: [
        {
          q: "How much does a dumpster rental cost?",
          a: `Our ${pricing.sizeYards}-yard dumpster rental is $${pricing.basePriceLabel} delivery + $${pricing.perDayPriceLabel} per day. This includes up to 2 tons of disposal. Each additional ton over 2 tons is $75. Completely transparent pricing.`,
        },
        {
          q: "Are there any hidden fees?",
          a: "No! Our price is all-inclusive. Delivery, pickup, disposal, and up to 2 tons are included. The only additional fee would be overage charges if you exceed the weight limit.",
        },
        {
          q: "Can I extend my rental?",
          a: "In many cases, yes. Extensions are based on availability and existing reservations. Call us before your scheduled pickup date, and we’ll confirm whether we can extend your rental.",
        },
        {
          q: "How do I book?",
          a: "Book online at <a href='/booking' class='text-primary hover:underline'>our booking page</a> or call <a href='tel:+15733564272' class='text-primary hover:underline'>(573) 356-4272</a>. Both methods take just a few minutes.",
        },
      ],
    },
    {
      title: "Delivery & Logistics",
      faqs: [
        {
          q: "Is same-day delivery available?",
          a: "Same-day delivery is available in Columbia. Other service areas may also qualify for same-day delivery depending on demand and scheduling—call us to confirm availability.",
        },
        {
          q: "What if I need delivery on a specific date?",
          a: "Let us know your preferred date when booking, and we'll do our best to accommodate. Same-day delivery is often available.",
        },
        {
          q: "What are your service areas?",
          a: "We serve Columbia, Jefferson City, Fulton, Moberly, and surrounding areas in central Missouri. <a href='/service-areas' class='text-primary hover:underline'>View our full service area list</a>.",
        },
        {
          q: "Can I change my pickup date?",
          a: "Yes! Call us before your scheduled pickup to reschedule. We can adjust your pickup date based on your timeline.",
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
      title: "Junk Removal Service",
      faqs: [
        {
          q: "What is your professional junk removal service?",
          a: "We offer full-service junk removal where our licensed, insured crews load, haul, and dispose of your items. Perfect for estate cleanouts, basement clearances, storm debris, and bulk hauling. You don't lift a finger!",
        },
        {
          q: "How does junk removal pricing work?",
          a: "Junk removal is priced based on volume and weight. Call <a href='tel:+15733564272' class='text-primary hover:underline'>(573) 356-4272</a> for a free quote, or describe what you need removed and we'll give you a price.",
        },
        {
          q: "What can you remove?",
          a: "We remove almost everything: furniture, appliances, yard waste, construction debris, e-waste, and more. We handle hazardous materials carefully and dispose of everything responsibly per local regulations.",
        },
        {
          q: "How fast can you schedule removal?",
          a: "Often the same or next day! Call us with your needs and we'll find the quickest available time slot.",
        },
        {
          q: "Do you haul away items from multiple rooms?",
          a: "Absolutely! We handle full house cleanouts, basement removals, multi-room projects, and more. The more you have, the better the per-item value.",
        },
      ],
    },
    {
      title: "Dumpster vs. Junk Removal",
      faqs: [
        {
          q: "Should I rent a dumpster or use junk removal?",
          a: "Use dumpster rental if YOU'LL be loading (remodeling, landscaping, home projects). Use professional junk removal if you want US to handle everything (cleanouts, estates, bulk hauling). Many customers use both for different projects!",
        },
        {
          q: "Can I compare costs?",
          a: `Dumpsters are great for known quantities over time: $${pricing.basePriceLabel} delivery + $${pricing.perDayPriceLabel}/day. Junk removal is project-based pricing—call us for a free quote on your specific job. Often they're similar in price, but removal saves time & effort.`,
        },
        {
          q: "What if I'm unsure which option is right?",
          a: "Call us! We'll ask about your project, volume, and timeline, then recommend the best (and most cost-effective) solution. No pressure, just honest guidance. <a href='tel:+15733564272' class='text-primary hover:underline'>(573) 356-4272</a>",
        },
        {
          q: "Can you remove items from a rental dumpster?",
          a: "Yes! If you want to rent a dumpster but need help loading it, ask about our professional loading service (starting at $149, price depends on the size of the job).",
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
          q: "Are you a veteran-owned business?",
          a: "Yes! We're proudly veteran-owned and licensed & insured. We're committed to serving central Missouri with excellence and integrity.",
        },
        {
          q: "What areas do you serve?",
          a: "We serve Columbia, Jefferson City, Fulton, Moberly, and surrounding central Missouri areas. Check our service areas page for details.",
        },
        {
          q: "How do I stay updated on promotions?",
          a: "Call us to get on our list for seasonal specials and volume discounts. Follow our social media for the latest offers!",
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
            Find answers to all your questions about dumpster rental and junk
            removal services.
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
                      <p
                        className="mt-4 text-white/80"
                        dangerouslySetInnerHTML={{ __html: faq.a }}
                      ></p>
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
