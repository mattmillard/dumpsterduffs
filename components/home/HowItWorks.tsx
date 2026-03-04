export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Book Online or Call",
      description:
        "Fill out our quick form or call us. Takes less than 5 minutes. Tell us your project details and preferred delivery date.",
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      number: "2",
      title: "We Deliver Fast",
      description:
        "We'll drop off your dumpster at your requested time. Same-day delivery in Columbia. We'll place it exactly where you want it.",
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
          />
        </svg>
      ),
    },
    {
      number: "3",
      title: "Load It Up",
      description:
        "Take your time filling the dumpster. Keep it for your entire rental period. Need more time? Just let us know—we're flexible.",
      icon: (
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      number: "4",
      title: "We Pick It Up",
      description:
        "Done with your project? Call or text us, and we'll pick up the dumpster. We handle all disposal—you don't lift a finger.",
      icon: (
        <svg
          className="w-12 h-12"
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
      ),
    },
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-secondary via-bg-alt to-primary/20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-primary/20 text-primary font-semibold rounded-full text-sm mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-[#999999] max-w-2xl mx-auto">
            Rent a dumpster shouldn&apos;t be complicated. Here&apos;s our
            4-step process to get you dumpin&apos; in no time.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Connector Line (desktop only) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-primary to-primary/50 z-0" />
                )}

                <div className="card p-6 text-center hover:shadow-xl transition-shadow relative z-10 bg-[#262626] h-full">
                  {/* Number Badge */}
                  <div className="w-16 h-16 bg-primary text-secondary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="text-primary mb-4 flex justify-center">
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#999999] text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-lg text-[#CCCCCC] mb-6">
            <strong>Ready to get started?</strong> Book now or call us with any
            questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#book-now" className="btn-primary">
              Book Your Dumpster
            </a>
            <a href="/faq" className="btn-secondary">
              View FAQ
            </a>
          </div>
        </div>
      </div>

      {/* WP MAPPING NOTES:
        - Create ACF repeater field for steps
        - Each step: number, title, description, icon (upload SVG or icon picker)
        - Consider using Gutenberg block pattern
        - Make CTA links editable via theme customizer or ACF
      */}
    </section>
  );
}
