export default function ServiceAreas() {
  // Missouri cities served (573 area code region)
  const serviceAreas = [
    { city: "Columbia", priority: "primary" },
    { city: "Jefferson City", priority: "primary" },
    { city: "Fulton", priority: "secondary" },
    { city: "Mexico", priority: "secondary" },
    { city: "Moberly", priority: "secondary" },
    { city: "Boonville", priority: "secondary" },
    { city: "Ashland", priority: "secondary" },
    { city: "Holts Summit", priority: "secondary" },
    { city: "Russellville", priority: "secondary" },
    { city: "California", priority: "secondary" },
    { city: "Centralia", priority: "secondary" },
    { city: "Wardsville", priority: "secondary" },
  ];

  const primaryAreas = serviceAreas.filter((a) => a.priority === "primary");
  const secondaryAreas = serviceAreas.filter((a) => a.priority === "secondary");

  return (
    <section className="section-padding bg-[#262626]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Proudly Serving Central Missouri
          </h2>
          <p className="text-lg text-[#999999] max-w-2xl mx-auto">
            Local, veteran-owned, and committed to our communities. Same-day
            delivery in Columbia.
          </p>
        </div>

        {/* Primary Service Areas */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {primaryAreas.map((area, idx) => (
              <div
                key={idx}
                className="card p-6 bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">
                      {area.city}
                    </h3>
                    {area.city === "Columbia" && (
                      <p className="text-sm text-primary font-semibold">
                        ✓ Same-day delivery
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Service Areas */}
        <div className="max-w-5xl mx-auto mb-8">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            We Also Serve:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {secondaryAreas.map((area, idx) => (
              <div key={idx} className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-lg shadow-sm text-sm font-semibold text-white hover:shadow-md transition-shadow hover:border-primary border border-transparent">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {area.city}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Map Placeholder / Not Listed CTA */}
        <div className="max-w-3xl mx-auto">
          <div className="card p-8 bg-gradient-to-br from-accent/30 to-primary/20 border-2 border-accent/40 text-center">
            <svg
              className="w-16 h-16 text-primary mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <h3 className="text-2xl font-bold text-white mb-3">
              Don&apos;t See Your City?
            </h3>
            <p className="text-[#999999] mb-6">
              We&apos;re always expanding! Call us to check if we service your
              area. We may be able to help even if you&apos;re not listed above.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+15733564272" className="btn-accent">
                Call: (573) 356-4272
              </a>
              <a href="/contact" className="btn-secondary">
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Service Area Stats */}
        <div className="mt-12 text-center text-sm text-[#808080]">
          <p>
            <strong>Service Radius:</strong> Up to 50 miles from Columbia, MO •
            <strong> Delivery Fee:</strong> Included in price for most areas
          </p>
        </div>
      </div>

      {/* WP MAPPING NOTES:
        - Create Custom Post Type: "service_areas"
        - Fields: city_name, priority (primary/secondary), same_day_available (yes/no), county
        - Generate individual service area pages dynamically from CPT
        - Each page: city name, custom content, schema LocalBusiness with serviceArea
        - Avoid thin content: add unique value per page (local regulations, permit info, etc.)
        - Use Yoast Local SEO or RankMath for location schema
      */}
    </section>
  );
}
