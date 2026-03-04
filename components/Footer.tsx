import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0F0F0F] text-white">
      {/* Main Footer */}
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="Dumpster Duff's"
                className="w-10 h-10"
              />
              <span className="font-bold text-xl text-primary">
                Dumpster Duff&apos;s
              </span>
            </div>
            <p className="text-[#999999] text-sm mb-4">
              Veteran-owned dumpster rental serving Missouri communities with
              pride since 2020.
            </p>
            <div className="flex gap-4 mt-4">
              <span className="trust-badge bg-[#262626] text-white border border-[#404040]">
                🇺🇸 US Veteran Owned
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2 text-[#999999] hover:text-white transition-colors">
              <li>
                <Link
                  href="/sizes-pricing"
                  className="hover:text-white transition-colors"
                >
                  Sizes & Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/service-areas"
                  className="hover:text-white transition-colors"
                >
                  Service Areas
                </Link>
              </li>
              <li>
                <Link
                  href="/contractors"
                  className="hover:text-white transition-colors"
                >
                  For Contractors
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-primary">
              Our Services
            </h4>
            <ul className="space-y-2 text-[#999999]">
              <li>15-Yard Dumpster Rental</li>
              <li>Same-Day Delivery (Columbia)</li>
              <li>Flexible Rental Periods</li>
              <li>Loading Services Available</li>
              <li>Residential Projects</li>
              <li>Commercial Projects</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-primary">Contact Us</h4>
            <ul className="space-y-3 text-[#999999]">
              <li>
                <a
                  href="tel:+15733564272"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
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
                  (573) 356-4272
                </a>
              </li>
              <li>
                <a
                  href="mailto:dustin@dumpsterduffs.com"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  dustin@dumpsterduffs.com
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="https://facebook.com/587799054419870"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Follow Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
            <p>© 2026 Dumpster Duff&apos;s. All rights reserved.</p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
