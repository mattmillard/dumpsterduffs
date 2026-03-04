export default function DualServiceShowcase() {
  return (
    <section className="bg-[#1A1A1A] py-16 lg:py-20 border-t border-[#404040]">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="text-primary">Your Way to Ditch Your Stuff</span>
          </h2>
          <p className="text-lg text-[#999999] text-balance">
            Whether you prefer to load it yourself or want professional service, Dumpster Duff has your solution
          </p>
        </div>

        {/* Service Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Option 1: Dumpster Rental */}
          <div className="bg-[#262626] rounded-xl p-8 border border-[#404040] hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Dumpster Rental</h3>
            </div>

            <p className="text-[#999999] mb-6">
              You fill it, we haul it. Perfect for bathroom renovations, garage cleanouts, and weekend projects.
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#999999]">15-yard size handles most projects</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#999999]">Rent for as long as you need</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#999999]">Same-day delivery in Columbia</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#999999]">Included disposal for up to 2 tons</span>
              </li>
            </ul>

            {/* Pricing */}
            <div className="bg-[#1A1A1A] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#808080] mb-1">Starting from</p>
              <p className="text-2xl font-bold text-white">
                $325 <span className="text-lg text-[#999999] font-normal">delivery</span> + <span className="text-primary">$5</span><span className="text-[#999999]">/day</span>
              </p>
            </div>

            <a href="#book-now" className="btn-primary w-full text-center">
              Book Your Dumpster
            </a>
          </div>

          {/* Option 2: Professional Junk Removal */}
          <div className="bg-[#262626] rounded-xl p-8 border border-[#404040] hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👷</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Professional Junk Removal</h3>
            </div>

            <p className="text-[#999999] mb-6">
              We handle everything. Basement cleanouts, estate sales, storm debris—no lifting required.
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#999999]">We load, haul & dispose</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#999999]">Unbeatable price per ton</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#999999]">Licensed & Insured crews</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#999999]">Fast turnaround times</span>
              </li>
            </ul>

            {/* Pricing */}
            <div className="bg-[#1A1A1A] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#808080] mb-1">Custom quote based on volume</p>
              <p className="text-2xl font-bold text-white">
                Call <span className="text-primary">(573) 356-4272</span>
              </p>
            </div>

            <a href="tel:+15733564272" className="btn-secondary w-full text-center block">
              Get Your Free Quote
            </a>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-[#0F0F0F] to-[#1A1A1A] rounded-xl p-8 border border-[#404040] text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            Not sure which is right for you?
          </h3>
          <p className="text-[#999999] mb-6">
            <strong className="text-white">Call Duff & Ditch Your Stuff</strong>—we'll help you choose the perfect solution
          </p>
          <a href="tel:+15733564272" className="btn-primary inline-block">
            Chat with a Duff Expert
          </a>
        </div>
      </div>
    </section>
  );
}
