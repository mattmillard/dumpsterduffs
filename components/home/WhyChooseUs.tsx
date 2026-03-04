export default function WhyChooseUs() {
  const benefits = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Fast & Reliable",
      points: [
        "Same-day delivery in Columbia",
        "Delivery within 2-4 hours (most Columbia orders)",
        "On-time guarantee or $50 off",
      ],
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Transparent Pricing",
      points: [
        "Price locked at booking",
        "No hidden fees or fuel charges",
        "All-inclusive: delivery + disposal + pickup",
      ],
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      title: "Veteran Owned & Local",
      points: [
        "Proudly serving Missouri communities",
        "Real people, real trucks, real service",
        "Supporting local since 2020",
      ],
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Hassle-Free Service",
      points: [
        "Flexible rental periods—keep it as long as you need",
        "Don't want to load? We'll do it for you",
        "Simple pickup: just text us when you're done",
      ],
    },
  ];

  return (
    <section className="section-padding bg-[#1A1A1A]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose Dumpster Duff&apos;s?
          </h2>
          <p className="text-lg text-[#999999] max-w-2xl mx-auto">
            We&apos;re not just another dumpster company. We&apos;re your
            neighbors, committed to making waste removal simple, fast, and
            affordable.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="card p-6 md:p-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary/20 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  {benefit.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {benefit.title}
                  </h3>
                  <ul className="space-y-2">
                    {benefit.points.map((point, pidx) => (
                      <li key={pidx} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-success flex-shrink-0 mt-0.5"
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
                        <span className="text-[#999999]">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Differentiator - Loading Service */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-accent/30 to-primary/20 rounded-2xl p-8 border-2 border-accent/40">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-8 h-8 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Don&apos;t Want to Load It Yourself?
                </h3>
                <p className="text-[#999999]">
                  We offer professional loading services! Just leave the junk,
                  and we&apos;ll handle the heavy lifting.
                  <strong className="text-primary">
                    {" "}
                    Add loading for just $149.
                  </strong>
                </p>
              </div>
              <a href="#book-now" className="btn-accent whitespace-nowrap">
                Request Loading Service
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* WP MAPPING NOTES:
        - Create custom post type or ACF repeater for benefits
        - Each benefit: icon (upload SVG or use icon library), title, points (repeater)
        - Loading service CTA box: ACF flexible content block
        - Make copy editable in WP admin
      */}
    </section>
  );
}
