# Dumpster Duff's Website Redesign

## 🎯 Project Overview

This is a conversion-optimized redesign of DumpsterDuffs.com built as a conceptual preview before WordPress implementation. The site focuses on increasing leads, improving clarity, and creating a modern mobile-first experience for a veteran-owned dumpster rental business in Missouri.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create production build
npm run build

# Run production server
npm start
```

---

## 📦 Deploy to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: GitHub Integration

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel auto-detects Next.js and deploys

---

## 🏗️ Tech Stack

- **Frontend App:** Next.js 15 (App Router) + React + TypeScript + Tailwind CSS
- **Source Control Flow:** GitHub repository (main branch deploy flow)
- **Hosting/Deploy Flow:** Vercel builds from GitHub and serves production
- **Domain/DNS/Edge Flow:** GoDaddy domain registration + Cloudflare DNS and edge controls
- **Auth/Admin Flow:** Supabase Auth + `admin_users` role model (`owner`, `admin`, `dispatcher`)
- **Booking Flow:** App Router multi-step booking routes (`/booking/address` -> `/booking/dates` -> `/booking/details` -> `/booking/review`)
- **Email Flow (Current/Target):** Resend for transactional sends + GoDaddy inboxes for human replies/receiving
- **Payments Flow:** Stripe currently configured; PayPal and Venmo planned next

---

## 🛠️ Admin Panel Documentation

### Admin Route Map

- `/admin` (redirects to dashboard)
- `/admin/login`
- `/admin/dashboard`
- `/admin/bookings`
- `/admin/calendar`
- `/admin/inventory`
- `/admin/pricing`
- `/admin/zones`
- `/admin/settings`

### Layout System

- Main admin shell is implemented in `app/admin/layout.tsx`.
- Desktop layout:
   - Persistent left sidebar via `components/admin/AdminSidebar.tsx`
   - Main content column with page-level padding
- Mobile layout:
   - Top operations header via `components/admin-mobile/MobileHeader.tsx`
   - Bottom navigation via `components/admin-mobile/MobileBottomNav.tsx`
   - Content area adds bottom spacing to avoid nav overlap

### Admin Panels (Modules)

- Dashboard Panel:
   - Route: `/admin/dashboard`
   - Purpose: KPIs, alerts, quick actions, active order visibility
- Bookings Panel:
   - Route: `/admin/bookings`
   - Purpose: booking management and order workflow
- Calendar Panel:
   - Route: `/admin/calendar`
   - Purpose: scheduling and operational timeline
- Inventory Panel:
   - Route: `/admin/inventory`
   - Purpose: dumpster/unit availability and status
- Service Zones Panel:
   - Route: `/admin/zones`
   - Purpose: service area and dispatch coverage controls
- Pricing Panel:
   - Route: `/admin/pricing`
   - Purpose: pricing configuration and updates
- Settings Panel:
   - Route: `/admin/settings`
   - Purpose: account and system settings

### Authentication and Roles

- Current auth guard runs in `app/admin/layout.tsx`.
- Admin identity is loaded from `lib/auth/admin.ts` (`getCurrentAdminUser`).
- Auth state updates are handled by `onAuthStateChange` subscription.
- Role model is defined in `types/admin.ts`:
   - `owner`
   - `admin`
   - `dispatcher`

### Navigation Behavior

- Desktop sidebar items: Dashboard, Bookings, Calendar, Inventory, Service Zones, Pricing.
- Mobile bottom nav items: Dashboard, Orders, Schedule, Inventory, Settings.
- Sign-out action routes through `/auth/signout`.

---

## 📂 Project Structure

```
/app
  layout.tsx          # Root layout with header/footer
  page.tsx            # Home page
  globals.css         # Global styles + design tokens

/components
  Header.tsx          # Main navigation
  Footer.tsx          # Site footer
  StickyCTA.tsx       # Mobile sticky CTA bar

  /home
    Hero.tsx          # Above-the-fold hero section
    InstantQuote.tsx  # Quote form with Square integration
    SizeOverview.tsx  # 15-yard dumpster details
    WhyChooseUs.tsx   # Benefits/differentiators
    HowItWorks.tsx    # 4-step process
    SocialProof.tsx   # Reviews + stats
    ServiceAreas.tsx  # Missouri cities served
    FAQTeaser.tsx     # FAQ accordion
    FinalCTA.tsx      # Bottom conversion section
```

---

## 🎨 Design System

### Design Direction: "Modern Contractor"

- **Primary Color:** Blue (#0066CC) - Trust, professionalism
- **Secondary Color:** Slate Gray (#2D3748) - Masculine, grounded
- **Accent Color:** Amber (#F59E0B) - Call-to-action, energy
- **Typography:** Inter (clean, modern, highly readable)
- **Style:** Rounded corners, soft shadows, approachable but confident

### CSS Variables (Design Tokens)

All design tokens are defined in `app/globals.css` and `tailwind.config.js`:

- Colors: `--color-primary`, `--color-secondary`, `--color-accent`
- Spacing: `--space-1` through `--space-16`
- Typography: `--text-xs` through `--text-5xl`
- Components: `--button-height`, `--input-height`, `--max-width`

---

## 🎯 Conversion Optimizations

### Key Improvements Over Current Site

1. **Price Transparency**
   - Starting price visible on hero ($299)
   - No "call for quote" friction
   - All-inclusive pricing messaging

2. **Size Clarity**
   - Single 15-yard size positioned as "perfect for most projects"
   - Visual comparisons (4-5 pickup trucks)
   - Detailed "ideal for" list with project types

3. **Trust Building**
   - Veteran-owned badge prominently displayed
   - Customer reviews with real names/projects
   - Stats: 1,200+ jobs, 4.9★ rating, 6 years in business
   - On-time guarantee ($50 off promise)

4. **Mobile-First UX**
   - Sticky CTA bar on mobile (call + book buttons)
   - Hamburger menu with clear hierarchy
   - Touch-friendly buttons (52px height)
   - Fast-loading, optimized images

5. **Clear User Journeys**
   - **Journey 1:** Hero → Instant Quote → Square Booking
   - **Journey 2:** Size Overview → Book This Size
   - **Journey 3:** Click-to-Call (low friction for phone users)

6. **Loading Service Upsell**
   - Unique differentiator highlighted
   - $149 add-on clearly positioned
   - Reduces "I don't want to do the work" objection

---

## 📞 Square Appointments Integration

### Current Implementation

- Placeholder link in `InstantQuote.tsx`: `https://square.site/book/YOUR_BOOKING_ID`
- Form captures: project type, ZIP code, additional details

### To Connect Square:

1. Set up Square Appointments account
2. Create booking service: "15-Yard Dumpster Rental"
3. Get your Square booking URL
4. Replace placeholder in `components/home/InstantQuote.tsx` (line 77)

### Alternative Integration Options:

- **Square JavaScript SDK:** Embed booking widget directly
- **API Integration:** Use Square Bookings API to create appointments programmatically
- **Zapier:** Connect form submissions to Square via webhook

---

## 🗺️ Sitemap & Information Architecture

```
HOME
├─ Hero (above fold)
├─ Instant Quote Widget
├─ Size Overview
├─ Why Choose Us
├─ How It Works
├─ Social Proof (Reviews)
├─ Service Areas
├─ FAQ Teaser
└─ Final CTA

FUTURE PAGES (Not yet built):
├─ Sizes & Pricing (detailed page)
├─ How It Works (full page)
├─ Service Areas (hub page + city subpages)
├─ For Contractors (business accounts)
├─ FAQ (full page with schema)
├─ About (story, team, guarantees)
└─ Contact
```

---

## 🔍 SEO/AEO Strategy

### On-Page Optimization

- **Title:** "Dumpster Duff's | Affordable 15-Yard Dumpster Rentals in Missouri"
- **Meta Description:** Includes veteran-owned, same-day delivery, price point
- **H1:** "Same-Day Dumpster Rental in Missouri – From $299"
- **Local Keywords:** Missouri, Columbia, Jefferson City, central Missouri

### Answer Engine Optimization (AEO)

- FAQ section targeting "People Also Ask" queries:
  - "How much does a dumpster rental cost in Missouri?"
  - "What size dumpster do I need for a kitchen remodel?"
  - "Do I need a permit for a dumpster?"
- Structured FAQ markup (schema.org/FAQPage) ready to implement

### Local SEO Elements

- Service area pages planned for 12+ Missouri cities
- LocalBusiness schema (to be added)
- Google Reviews integration (link in footer + social proof section)

### Entity-Rich Content

- Specific project types: kitchen remodel, roofing, garage cleanout
- Weight limits: 2 tons included
- Dimensions: 16' × 8' × 4'
- Service radius: 50 miles from Columbia, MO

---

## 🧩 WordPress Mapping Guide

### Theme Recommendation

- **Kadence Theme** (flexible blocks, fast) OR
- **GeneratePress Premium** (lightweight, great for local businesses) OR
- **Custom child theme** based on Underscores (\_s)

### Page Structure

Each section can be:

1. **Gutenberg Blocks** (reusable, user-friendly)
2. **ACF Flexible Content** (more control, developer-friendly)
3. **Page Builder** (Elementor/Beaver Builder - if client prefers visual editing)

### Component Mapping

| React Component    | WordPress Implementation                                  |
| ------------------ | --------------------------------------------------------- |
| `Header.tsx`       | Header template part + Customizer settings                |
| `Footer.tsx`       | Footer template part + Widget areas                       |
| `Hero.tsx`         | ACF fields (headline, CTA text, hero image)               |
| `InstantQuote.tsx` | Gravity Forms + Square integration (or WPForms)           |
| `SizeOverview.tsx` | ACF fields for dumpster specs                             |
| `WhyChooseUs.tsx`  | ACF Repeater (icon, title, bullet points)                 |
| `HowItWorks.tsx`   | ACF Repeater (step number, title, description, icon)      |
| `SocialProof.tsx`  | Custom Post Type: "Reviews" (name, project, rating, text) |
| `ServiceAreas.tsx` | Custom Post Type: "Service Areas" (generates city pages)  |
| `FAQTeaser.tsx`    | ACF Repeater or FAQ CPT + Yoast FAQ block                 |

### Plugins Needed

- **Advanced Custom Fields Pro** (or Meta Box)
- **Gravity Forms** or **WPForms** (for quote form)
- **Square for WooCommerce** (for appointments integration)
- **Yoast SEO** or **Rank Math** (for schema markup)
- **WP Rocket** or **LiteSpeed Cache** (performance)
- **Kadence Blocks** (if using Kadence theme)

### Schema Markup

Add via Yoast/Rank Math or custom JSON-LD:

- **LocalBusiness** (home page)
- **Service** (dumpster rental service)
- **FAQPage** (FAQ section)
- **Review/AggregateRating** (social proof)

---

## 📝 Content Strategy

### Tagline Options (10)

1. "When you're ready to get rid of some junk and stuff, call Duff!" _(current - keep it!)_
2. "Same-Day Dumpsters. No Hidden Fees. Veteran Owned."
3. "Missouri's Most Reliable Dumpster Rental."
4. "Fast Delivery. Fair Pricing. Veteran Strong."
5. "One Size. Zero Confusion. Delivered Fast."
6. "Get Your Dumpster. Get It Done."
7. "The Easy Button for Junk Removal."
8. "Dumpsters Done Right. Guaranteed."
9. "Work Hard. Dump Easy."
10. "Central Missouri's Go-To Dumpster Service."

### CTA Microcopy Options (20)

**Primary CTAs (High Intent):**

1. "Book Now" _(primary on hero)_
2. "Book Your Dumpster Now"
3. "Get Your Dumpster Today"
4. "Reserve Your Dumpster"
5. "Book This Size"
6. "Get Instant Quote & Book"

**Secondary CTAs (Lower Friction):** 7. "Get Free Quote" 8. "See Price & Book" 9. "Check Availability" 10. "Get Your Price in 30 Seconds"

**Phone CTAs:** 11. "Call Now: (573) 356-4272" 12. "Call Duff!" 13. "Talk to a Real Person" 14. "Call Us Today"

**Exploratory CTAs:** 15. "View Full Size Guide" 16. "See How It Works" 17. "View All FAQs" 18. "See All Service Areas" 19. "Request Loading Service" 20. "Set Up Contractor Account"

### Service Page Copy Patterns

**Template for City Pages (avoid thin content):**

```
# Dumpster Rental in [City], Missouri

## Local, Veteran-Owned Service in [City]
[Paragraph about serving this specific community]

## Why [City] Residents Choose Dumpster Duff's
- Same-day delivery to [neighborhood names]
- [X] projects completed in [City] since [year]
- Familiar with [City] permit requirements

## Common Projects in [City]
[List local project types - e.g., "roofing after Missouri storms"]

## [City] Service Details
- Delivery time: [X hours]
- Permit info: [Local city hall contact]
- Disposal regulations: [Local landfill rules]

## Book Your [City] Dumpster Rental Today
[CTA]

## FAQ: Dumpster Rental in [City]
[3-5 local FAQs]
```

---

## ✅ Conversion Checklist

### Above the Fold (Hero)

- [x] Clear value proposition
- [x] Starting price visible
- [x] Dual CTAs (book + call)
- [x] Trust badges (veteran, rating, insured)
- [x] Hero image shows real dumpster/job site

### Trust Elements

- [x] Veteran-owned badge (prominent)
- [x] Customer reviews with names
- [x] Stats (1,200+ jobs, 4.9 stars)
- [x] On-time guarantee
- [x] No hidden fees promise
- [x] Licensed & insured badge

### Friction Reducers

- [x] Instant price estimate (no phone required)
- [x] Simple 3-field quote form
- [x] Same-day delivery messaging
- [x] Flexible rental periods
- [x] Loading service option
- [x] Permit guidance

### Mobile Optimization

- [x] Sticky CTA bar (call + book)
- [x] Hamburger menu
- [x] Large tap targets (52px buttons)
- [x] Readable font sizes (16px base)
- [x] Fast loading (Next.js optimized)

### Local SEO

- [x] City names in hero headline
- [x] Service area section with 12+ cities
- [x] (573) area code visible
- [x] "Missouri" mentioned multiple times
- [ ] Schema markup (to implement in WP)
- [ ] Google My Business integration

---

## 🎨 Design Deliverables Summary

### ✅ Completed

1. **Discovery Snapshot** - Analysis of current site issues
2. **Sitemap & IA** - Page structure + user journeys
3. **Home Page Wireframe** - 9 sections, fully detailed
4. **Design Direction** - "Modern Contractor" with full tokens
5. **Component Library** - All home page components built
6. **Codebase Scaffold** - Next.js app fully functional

### Content Packages Included

- 10 tagline options
- 20 CTA variations
- FAQ copy targeting PAA queries
- Service area page template
- Schema recommendations

---

## 🚧 Next Steps

### Phase 1: Preview & Feedback

- [ ] Deploy to Vercel
- [ ] Share preview link with stakeholders
- [ ] Gather feedback on design/copy
- [ ] A/B test CTA variations

### Phase 2: Additional Pages

- [ ] Build "Sizes & Pricing" page
- [ ] Build "How It Works" full page
- [ ] Build "Service Areas" hub + city templates
- [ ] Build "For Contractors" page
- [ ] Build "About" page
- [ ] Build "Contact" page
- [ ] Build "FAQ" full page

### Phase 3: WordPress Implementation

- [ ] Set up WordPress site (hosting recommendation: Kinsta, SiteGround, or WP Engine)
- [ ] Install theme + required plugins
- [ ] Create ACF field groups
- [ ] Build page templates
- [ ] Migrate content
- [ ] Integrate Square Appointments
- [ ] Add schema markup
- [ ] Set up Google My Business
- [ ] Configure Google Analytics + Google Tag Manager
- [ ] Test all forms
- [ ] Mobile testing (real devices)
- [ ] Speed optimization (target: <2s load time)

### Phase 4: Launch & Optimization

- [ ] Set up 301 redirects from old URLs
- [ ] Submit new sitemap to Google Search Console
- [ ] Set up Google Ads conversion tracking
- [ ] Install heatmap tool (Hotjar, Microsoft Clarity)
- [ ] Monitor form completion rates
- [ ] A/B test hero CTAs
- [ ] Collect customer reviews
- [ ] Local link building (chamber of commerce, local directories)

---

## 📊 Success Metrics

### Primary KPIs

- **Form Submissions:** Target +50% increase
- **Phone Calls:** Track via CallRail or similar
- **Bounce Rate:** Target <50%
- **Time on Site:** Target >2 minutes
- **Mobile Conversion Rate:** Target 3-5%

### Secondary KPIs

- **Google Rankings:** Track for "dumpster rental [city]"
- **Page Speed:** Target <2s load, 90+ Lighthouse score
- **Review Growth:** Target 10+ new reviews/month

---

## 🤝 Contributing

This is a client project. For questions or change requests, contact the team lead.

---

## 📄 License

Proprietary - © 2026 Dumpster Duff's

---

## 📞 Support

For technical questions about this preview build:

- Email: [your-email@example.com]
- Phone: (573) 356-4272

For WordPress implementation questions, refer to the "WordPress Mapping Guide" section above.

---

**Built for Dumpster Duff's - Proudly serving Missouri since 2020 🇺🇸**
