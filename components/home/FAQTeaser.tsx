export default function FAQTeaser() {
  const faqs = [
    {
      question: "How much does a dumpster rental cost in Missouri?",
      answer:
        "Our 15-yard dumpster rental is $325 delivery + $5 per day. This includes up to 2 tons of disposal. Each additional ton is $75. No hidden fees—transparent pricing, every time.",
      schema: true,
    },
    {
      question: "What size dumpster do I need for my project?",
      answer:
        "Our 15-yard dumpster is perfect for most residential projects including kitchen remodels, garage cleanouts, roofing jobs (up to 2,000 sq ft), and small deck removals. It holds about 4-5 pickup truck loads. Call us if you need help determining the right fit.",
      schema: true,
    },
    {
      question: "How long can I keep the dumpster?",
      answer:
        "Standard rental is 7 days, but we offer flexible periods. Keep it as long as you need—just let us know. Need more time? We can extend your rental for a small daily fee.",
      schema: true,
    },
    {
      question: "What can't go in the dumpster?",
      answer:
        "We accept most household junk, construction debris, furniture, appliances, and yard waste. We CANNOT accept: hazardous materials, chemicals, paint, tires, batteries, or electronics. Call us if you're unsure about specific items.",
      schema: true,
    },
    {
      question: "Do I need a permit for a dumpster?",
      answer:
        "If the dumpster is placed on your private property (driveway, yard), usually no permit is needed. If it's on the street or public property, you may need a permit from your city. We can help guide you through the process.",
      schema: true,
    },
  ];

  return (
    <section className="section-padding bg-[#1A1A1A]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-[#999999] max-w-2xl mx-auto">
            Got questions? We&apos;ve got answers. Here are the most common
            questions we hear from customers.
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="card p-6 group bg-[#262626]">
              <summary className="flex items-start justify-between cursor-pointer list-none">
                <h3 className="text-lg font-bold text-white pr-4 flex-1">
                  {faq.question}
                </h3>
                <svg
                  className="w-6 h-6 text-primary flex-shrink-0 transform transition-transform group-open:rotate-180"
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
              <div className="mt-4 text-[#999999] leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        {/* CTA to Full FAQ Page */}
        <div className="mt-12 text-center">
          <p className="text-[#999999] mb-4">Still have questions?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/faq" className="btn-secondary">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              View All FAQs
            </a>
            <a
              href="tel:+15733564272"
              className="btn bg-[#262626] text-white border-2 border-primary/30 hover:border-primary hover:text-primary"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call Us: (573) 356-4272
            </a>
          </div>
        </div>
      </div>

      {/* WP MAPPING NOTES:
        - Create Custom Post Type: "faqs" OR use ACF repeater on FAQ page template
        - Fields: question, answer, category (optional for grouping)
        - Use details/summary for native accordion (no JS needed)
        - Add schema.org FAQPage structured data for SEO
        - Example schema:
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
              "@type": "Question",
              "name": "How much does a dumpster rental cost?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our 15-yard dumpster rental starts at $299..."
              }
            }]
          }
        - Use Yoast FAQ block or RankMath for easy schema implementation
      */}
    </section>
  );
}
