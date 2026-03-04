import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Dumpster Duff's",
  description:
    "Our simple 4-step dumpster rental process. Book online or call, we deliver fast, you load it up, we pick it up. Same-day delivery available.",
};

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Book Online or Call",
      description:
        "Fill out our quick online form or call us at <a href='tel:+15733564272' class='text-primary hover:underline'>(573) 356-4272</a>. Takes less than 5 minutes. Tell us your project details and preferred delivery date.",
      details: [
        "Choose your rental period (standard: 7 days)",
        "Tell us about your project",
        "Select preferred delivery date/time",
        "Receive instant price quote",
      ],
    },
    {
      number: "2",
      title: "We Deliver Fast",
      description:
        "We'll drop off your dumpster at your requested time. Same-day delivery available for most orders. We'll place it exactly where you want it.",
      details: [
        "Delivery within 2-4 hours for most orders",
        "Same-day delivery available",
        "Professional placement",
        "Photo documentation on request",
      ],
    },
    {
      number: "3",
      title: "Load It Up",
      description:
        "Take your time filling the dumpster. Keep it for your entire rental period. Need more time? Just let us know—we're flexible.",
      details: [
        "Keep rental for up to 7 days (or longer)",
        "Up to 2 tons of waste included",
        "No rush—work at your own pace",
        "Optional loading service available",
      ],
    },
    {
      number: "4",
      title: "We Pick It Up",
      description:
        "Done with your project? Call or text us, and we'll pick up the dumpster. We handle all disposal—you don't lift a finger.",
      details: [
        "Call or text us when ready",
        "Flexible pickup scheduling",
        "Professional removal",
        "Full cleanup at pickup",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-secondary pt-24 pb-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h1>
          <p className="text-xl text-white/70 mb-12">
            Simple, straightforward process. No complicated steps. Just book,
            load, and done.
          </p>

          {/* Steps */}
          <div className="space-y-8 mb-12">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="card p-8 bg-bg-alt border-l-4 border-primary"
              >
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 bg-primary text-secondary rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold shadow-lg">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-white/80 mb-4 text-lg">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, didx) => (
                        <li key={didx} className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
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
                          <span className="text-white/70">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Visual */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">
              Typical Timeline
            </h3>
            <div className="card p-8 bg-bg-alt">
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { label: "Book", time: "2-5 min" },
                  { label: "Deliver", time: "2-4 hours" },
                  { label: "Load", time: "2-7 days" },
                  { label: "Pickup", time: "30 min" },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-lg font-bold text-primary mb-2">
                      {item.label}
                    </div>
                    <div className="text-white/70">{item.time}</div>
                  </div>
                ))}
              </div>
              <p className="text-center text-white/60 text-sm mt-6">
                Total from booking to pickup: typically 3-11 days (depending on
                your chosen rental period)
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">
              Common Questions
            </h3>
            <div className="space-y-4">
              {[
                {
                  q: "How do I book?",
                  a: "You can book online using our form above, or call us at <a href='tel:+15733564272' class='text-primary hover:underline'>(573) 356-4272</a>. Both methods take just a few minutes.",
                },
                {
                  q: "What if I need delivery on a specific date?",
                  a: "Let us know your preferred date and time when booking. We do our best to accommodate requests. Same-day delivery is often available.",
                },
                {
                  q: "What if I need to change my pickup date?",
                  a: "No problem! Just call us before your scheduled pickup date, and we can reschedule at no additional cost.",
                },
                {
                  q: "Can I call instead of booking online?",
                  a: "Absolutely! Call <a href='tel:+15733564272' class='text-primary hover:underline'>(573) 356-4272</a> and our team will book you right over the phone.",
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
              Ready to get started?
            </h3>
            <p className="text-white/70 mb-6">
              Choose the button below to book your dumpster or give us a call.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#book-now" className="btn-primary">
                Start Your Booking
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
