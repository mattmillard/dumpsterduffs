export default function SizeOverview() {
  const dumpsterInfo = {
    size: "15 Yard",
    dimensions: "16' L × 8' W × 4' H",
    idealFor: [
      "Kitchen or bathroom remodels",
      "Garage or attic cleanouts",
      "Small deck removal",
      "Roofing projects (up to 2,000 sq ft)",
      "Yard debris and landscaping",
      "Estate cleanouts",
    ],
    weight: "Up to 2 tons included",
    price: "$325 + $5/day",
  };

  return (
    <section className="section-padding bg-[#0F0F0F]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-primary/20 text-primary font-semibold rounded-full text-sm mb-4">
            One Size. Less Confusion.
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Perfect Size for Most Projects
          </h2>
          <p className="text-lg text-[#999999] max-w-2xl mx-auto">
            We specialize in 15-yard dumpsters because they&apos;re the
            Goldilocks of dumpster rentals—not too big, not too small, just
            right for 90% of residential and small commercial projects.
          </p>
        </div>

        {/* Main Size Card */}
        <div className="max-w-5xl mx-auto">
          <div className="card overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: Visual */}
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-xs">
                  {/* Dumpster Illustration */}
                  <div className="bg-primary rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
                    <div className="space-y-2">
                      <div className="h-3 bg-[#404040] rounded"></div>
                      <div className="h-3 bg-[#404040] rounded"></div>
                      <div className="h-3 bg-[#404040] rounded w-3/4"></div>
                    </div>
                  </div>
                </div>

                {/* Price Badge */}
                <div className="mt-6 bg-primary/10 rounded-lg shadow-md px-6 py-4 text-center border border-primary/30">
                  <p className="text-sm text-[#999999]">Starting at</p>
                  <p className="text-4xl font-bold text-primary">
                    {dumpsterInfo.price}
                  </p>
                  <p className="text-sm text-[#808080] mt-1">7-day rental</p>
                </div>
              </div>

              {/* Right: Details */}
              <div className="p-8">
                <div className="flex items-baseline gap-3 mb-4">
                  <h3 className="text-4xl font-bold text-white">
                    {dumpsterInfo.size}
                  </h3>
                  <span className="text-lg text-[#999999]">Dumpster</span>
                </div>

                {/* Specs */}
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                    <span className="text-[#999999]">
                      <strong>Dimensions:</strong> {dumpsterInfo.dimensions}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0"
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
                    <span className="text-[#999999]">
                      <strong>Capacity:</strong> {dumpsterInfo.capacity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                      />
                    </svg>
                    <span className="text-[#999999]">
                      <strong>Weight limit:</strong> {dumpsterInfo.weight}
                    </span>
                  </div>
                </div>

                {/* Ideal For */}
                <div className="mb-6">
                  <h4 className="font-bold text-lg text-white mb-3">
                    Perfect for:
                  </h4>
                  <ul className="space-y-2">
                    {dumpsterInfo.idealFor.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
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
                        <span className="text-white/70">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <a href="#book-now" className="btn-primary w-full text-center">
                  Book This Size
                </a>
              </div>
            </div>
          </div>

          {/* Not Sure Section */}
          <div className="mt-8 text-center">
            <p className="text-[#999999] mb-4">
              <strong>Not sure if this size works for your project?</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+15733564272" className="btn-secondary">
                Call Us: (573) 356-4272
              </a>
              <a
                href="/how-it-works#size-calculator"
                className="btn bg-[#262626] text-white border-2 border-primary/30 hover:border-primary hover:text-primary"
              >
                Use Size Calculator
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* WP MAPPING NOTES:
        - Create ACF fields for dumpster specs (size, dimensions, capacity, price)
        - Use repeater field for "ideal for" list
        - Make price/specs editable in WordPress admin
        - Could use Pods or ACF for structured content
      */}
    </section>
  );
}
