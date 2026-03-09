"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="bg-[#1A1A1A] shadow-lg sticky top-0 z-50 border-b border-[#404040]">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo-horizontal.png"
              alt="Dumpster Duff's"
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/sizes-pricing"
              className="text-white hover:text-primary font-semibold transition-colors"
            >
              Sizes & Pricing
            </Link>
            <Link
              href="/junk-removal"
              className="text-white hover:text-primary font-semibold transition-colors"
            >
              Junk Removal
            </Link>
            <Link
              href="/how-it-works"
              className="text-white hover:text-primary font-semibold transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/service-areas"
              className="text-white hover:text-primary font-semibold transition-colors"
            >
              Service Areas
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-primary font-semibold transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+15733564272"
              className="text-primary font-bold text-lg hover:text-accent transition-colors"
            >
              (573) 356-4272
            </a>
            <a href="/booking" className="btn-primary">
              Book Now
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-bg-alt">
            <nav className="flex flex-col gap-4">
              <Link
                href="/sizes-pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-primary font-semibold py-2 transition-colors"
              >
                Sizes & Pricing
              </Link>
              <Link
                href="/junk-removal"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-primary font-semibold py-2 transition-colors"
              >
                Junk Removal
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-primary font-semibold py-2 transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/service-areas"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-primary font-semibold py-2 transition-colors"
              >
                Service Areas
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-primary font-semibold py-2 transition-colors"
              >
                About
              </Link>
              <a
                href="tel:+15733564272"
                onClick={() => setMobileMenuOpen(false)}
                className="text-primary font-bold text-lg py-2"
              >
                (573) 356-4272
              </a>
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary mt-2"
              >
                Book Now
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
