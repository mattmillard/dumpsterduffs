export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-primary/10 pt-8 pb-16 lg:pt-12 lg:pb-20">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Copy & CTA */}
          <div className="order-2 lg:order-1">
            {/* Trust Badges Above Headline */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="trust-badge">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                4.9★ Rating
              </span>
              <span className="trust-badge">US Veteran Owned</span>
              <span className="trust-badge">✓ Licensed & Insured</span>
              <span className="trust-badge">🚚 Junk Removal Experts</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-balance">
              <span className="text-primary">Call Duff & Ditch Your Stuff</span>
            </h1>

            <p className="text-lg md:text-xl text-[#999999] mb-8 text-balance">
              Junk removal & dumpster rentals in Missouri. We handle it your
              way.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <div>
                <p className="text-sm text-[#808080] mb-2">
                  🛒 Rent a Dumpster
                </p>
                <a href="#book-now" className="btn-primary text-center block">
                  <svg
                    className="w-6 h-6 mr-2 inline"
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
                  Rent a Dumpster
                </a>
                <p className="text-xs text-[#666666] mt-2">
                  From $325 delivery + $5/day
                </p>
              </div>
              <div>
                <p className="text-sm text-[#808080] mb-2">
                  👷 Professional Removal
                </p>
                <a
                  href="tel:+15733564272"
                  className="btn-secondary text-center block"
                >
                  <svg
                    className="w-6 h-6 mr-2 inline"
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
                  Call for Quote
                </a>
                <p className="text-xs text-[#666666] mt-2">We handle it all</p>
              </div>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
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
                <span className="text-[#999999]">
                  Same-day delivery in Columbia
                </span>
              </div>
              <div className="flex items-start gap-2">
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
                <span className="text-[#999999]">Flexible rental periods</span>
              </div>
              <div className="flex items-start gap-2">
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
                <span className="text-[#999999]">
                  Loading service available
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <img
                src="https://dumpsterduffs.com/wp-content/uploads/2025/03/img-g8J0QQnyl9sQTvMJB6xJQ-3.jpeg"
                alt="Professional dumpster delivery on residential driveway"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              {/* Floating Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#1A1A1A] rounded-lg shadow-xl p-4 border-l-4 border-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#999999]">
                      Perfect Size for Most Projects
                    </p>
                    <p className="text-2xl font-bold text-white">
                      15 Yard Dumpster
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#999999]">From</p>
                    <p className="text-3xl font-bold text-primary">$325</p>
                    <p className="text-xs text-[#808080]">+ $5/day</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
