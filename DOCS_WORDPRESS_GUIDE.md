# WORDPRESS IMPLEMENTATION GUIDE

**Project:** Dumpster Duff's Redesign  
**Target CMS:** WordPress  
**Preview Build:** Next.js (this repository)

---

## 🎯 IMPLEMENTATION STRATEGY

This Next.js site is a **conceptual preview** to finalize design and content BEFORE building in WordPress. This approach saves time and money by:

1. Getting client/stakeholder approval on look and feel
2. Testing conversion flow with real users (via Vercel link)
3. Having pixel-perfect reference for WordPress developers
4. Avoiding expensive WordPress revisions

---

## 🏗️ RECOMMENDED WORDPRESS STACK

### Hosting

**Tier 1 (Best Performance):**

- **Kinsta** - Managed WordPress, Google Cloud, excellent support
- **WP Engine** - Enterprise-grade, built for agencies
- **Flywheel** - Designer-friendly, great for small businesses

**Tier 2 (Good Value):**

- **SiteGround** - Reliable, affordable, good support
- **Cloudways** - Flexible, DigitalOcean backend

### Theme Options

#### Option 1: Kadence Theme (RECOMMENDED)

- **Why:** Fast, flexible blocks, mobile-optimized, SEO-friendly
- **Cost:** Free (Pro version $129/year for advanced features)
- **Ease:** 7/10 - User can manage most content
- **Dev Time:** ~40-60 hours for full implementation

#### Option 2: GeneratePress Premium

- **Why:** Lightweight (sub-30KB), fast, great for local businesses
- **Cost:** $59/year
- **Ease:** 8/10 - Very user-friendly
- **Dev Time:** ~40-60 hours

#### Option 3: Custom Child Theme (Underscores)

- **Why:** Maximum control, no bloat, unique branding
- **Cost:** Free (dev time only)
- **Ease:** 5/10 - Requires developer for changes
- **Dev Time:** ~80-100 hours

**RECOMMENDATION:** Kadence Theme for balance of power, speed, and ease.

---

## 🔌 REQUIRED PLUGINS

### Core Functionality

1. **Advanced Custom Fields (ACF) Pro** - $49/year
   - Field groups for all custom content
   - Flexible content for modular pages
   - Repeaters for reviews, FAQs, benefits

2. **Gravity Forms** OR **WPForms** - $59-159/year
   - Quote form with conditional logic
   - Square Appointments integration
   - Email notifications

3. **Square for WooCommerce** OR **Square Appointments** integration
   - Booking widget embed
   - OR Zapier webhook to Square API

### SEO & Schema

4. **Yoast SEO** (free) OR **Rank Math** (free/pro)
   - LocalBusiness schema
   - FAQ schema
   - Review/AggregateRating schema
   - Breadcrumbs

### Performance

5. **WP Rocket** ($49/year) OR **LiteSpeed Cache** (free)
   - Page caching
   - Image lazy loading
   - Minification
   - Target: <2s load time, 90+ Lighthouse score

### Additional Recommended

6. **Smush** OR **ShortPixel** - Image optimization
7. **Wordfence** OR **Sucuri** - Security
8. **UpdraftPlus** - Backups
9. **WP Mail SMTP** - Reliable form delivery
10. **Contact Form 7** - Simple contact forms (if not using Gravity/WPForms)

---

## 📂 CONTENT STRUCTURE

### Custom Post Types Needed

#### 1. Reviews

**Fields:**

- `customer_name` (text)
- `customer_initials` (text, 2 chars)
- `project_type` (text, e.g., "Kitchen Renovation")
- `rating` (number, 1-5)
- `review_text` (textarea)
- `review_date` (date)
- `featured` (true/false - for homepage display)

**Display Logic:**

- Homepage: 3 featured reviews
- Reviews page: All reviews, paginated
- Schema: AggregateRating + individual Review markup

#### 2. Service Areas

**Fields:**

- `city_name` (text)
- `county` (text)
- `priority` (select: primary, secondary)
- `same_day_delivery` (true/false)
- `custom_content` (WYSIWYG - unique value per city)
- `permit_info` (textarea - city hall contact, permit requirements)
- `local_regulations` (textarea)
- `service_radius_miles` (number)

**URL Structure:**

- `/service-areas/` (hub page)
- `/service-areas/columbia-mo/` (individual city)
- `/service-areas/jefferson-city-mo/`

**Schema:** LocalBusiness with `areaServed` property

#### 3. FAQs (Optional - can use ACF repeater instead)

**Fields:**

- `question` (text)
- `answer` (WYSIWYG)
- `category` (taxonomy: General, Pricing, Process, Regulations)
- `show_on_homepage` (true/false)

**Schema:** FAQPage markup

---

## 🎨 PAGE TEMPLATES NEEDED

### Template 1: Home Page

**File:** `page-home.php` OR Kadence block pattern

**Sections (Map to React Components):**

1. Hero - ACF fields: headline, subhead, CTA text, hero image
2. Instant Quote - Gravity Form embed
3. Size Overview - ACF fields: dumpster specs, pricing
4. Why Choose Us - ACF Repeater: (icon, title, points[])
5. How It Works - ACF Repeater: (step number, title, description, icon)
6. Social Proof - WP_Query: Reviews CPT (featured = true, limit 3)
7. Service Areas - WP_Query: Service Areas CPT
8. FAQ Teaser - ACF Repeater OR WP_Query: FAQs (show_on_homepage = true, limit 5)
9. Final CTA - ACF fields: headline, CTA text

**ACF Field Group: "Home Page Content"**

### Template 2: Service Area (Single)

**File:** `single-service_area.php`

**Sections:**

- Hero with city name
- "Why Choose Dumpster Duff's in [City]"
- Service details (delivery time, permit info)
- Common projects in this area
- Local FAQs
- CTA to book

**Dynamic Content:**

- `<?php the_title(); ?>` for city name
- `<?php the_field('custom_content'); ?>` for unique content
- Schema: LocalBusiness with specific `areaServed`

### Template 3: FAQ Page

**File:** `page-faq.php`

**Layout:**

- Category tabs (General, Pricing, Process, Regulations)
- Accordion (native `<details>` HTML or jQuery)
- Schema: FAQPage JSON-LD

### Template 4: Contractor Page

**File:** `page-contractors.php`

**Sections:**

- Benefits for contractors (volume discounts, NET terms, dedicated rep)
- Account signup form (Gravity Forms)
- Testimonials from contractors
- CTA to set up account

---

## 🧩 COMPONENT MAPPING (React → WordPress)

| React Component    | WordPress Implementation    | Notes                                                        |
| ------------------ | --------------------------- | ------------------------------------------------------------ |
| `Header.tsx`       | `header.php` + Customizer   | Logo, menu, phone number (Customizer settings)               |
| `Footer.tsx`       | `footer.php` + Widget areas | 4 widget areas (Company, Links, Services, Contact)           |
| `StickyCTA.tsx`    | Custom JS in footer         | Show on scroll >500px, mobile only                           |
| `Hero.tsx`         | ACF fields                  | headline, subhead, cta_text, cta_url, hero_image             |
| `InstantQuote.tsx` | Gravity Forms + ACF         | Form ID in ACF, Square integration                           |
| `SizeOverview.tsx` | ACF fields                  | size, dimensions, capacity, weight_limit, price, ideal_for[] |
| `WhyChooseUs.tsx`  | ACF Repeater                | benefits[icon_svg, title, points[text]]                      |
| `HowItWorks.tsx`   | ACF Repeater                | steps[number, title, description, icon_svg]                  |
| `SocialProof.tsx`  | WP_Query + ACF Options      | Reviews CPT + stats (ACF Options page)                       |
| `ServiceAreas.tsx` | WP_Query                    | Service Areas CPT                                            |
| `FAQTeaser.tsx`    | ACF Repeater OR CPT         | faqs[question, answer]                                       |
| `FinalCTA.tsx`     | ACF fields                  | headline, cta_text, cta_url                                  |

---

## 🎯 SQUARE APPOINTMENTS INTEGRATION

### Option 1: Square Widget Embed (EASIEST)

1. Set up Square Appointments account
2. Create service: "15-Yard Dumpster Rental - $299"
3. Get embed code from Square dashboard
4. Add to WordPress via shortcode or HTML block

**Shortcode Example:**

```php
// functions.php
function square_booking_widget() {
    return '<script src="https://square.site/appointments/buyer/widget/YOUR_ID.js"></script>';
}
add_shortcode('square_booking', 'square_booking_widget');
```

**Usage:** `[square_booking]` in page editor

### Option 2: Gravity Forms + Zapier + Square (MORE CONTROL)

1. User fills Gravity Form (project type, ZIP, details)
2. Form submission triggers Zapier webhook
3. Zapier creates Square Appointment
4. User receives email confirmation with Square booking link

**Pro:** More data capture, qualification  
**Con:** Requires Zapier subscription ($20/month)

### Option 3: Square Bookings API (MOST CUSTOM)

1. Direct API integration with Square Bookings API
2. Custom form creates appointment programmatically
3. Real-time availability checking

**Pro:** Full control, best UX  
**Con:** Requires developer, ongoing maintenance

**RECOMMENDATION:** Start with Option 1 (widget embed), upgrade to Option 2 if more control needed.

---

## 📋 ACF FIELD GROUPS

### Field Group 1: Home Page Content

**Location:** Page Template = Home

**Fields:**

- **Hero Section**
  - `hero_headline` (text)
  - `hero_subhead` (textarea)
  - `hero_cta_primary_text` (text)
  - `hero_cta_primary_url` (URL)
  - `hero_cta_secondary_text` (text)
  - `hero_cta_secondary_url` (URL)
  - `hero_image` (image)
- **Instant Quote Section**
  - `quote_form_id` (text - Gravity Form ID)
  - `quote_headline` (text)
  - `quote_subhead` (text)

- **Size Overview**
  - `dumpster_size` (text, default: "15 Yard")
  - `dumpster_dimensions` (text)
  - `dumpster_capacity` (text)
  - `dumpster_weight_limit` (text)
  - `dumpster_price` (text)
  - `ideal_for` (repeater: text[])

- **Why Choose Us**
  - `benefits` (repeater):
    - `icon_svg` (textarea - paste SVG code)
    - `title` (text)
    - `points` (repeater: text[])

- **How It Works**
  - `steps` (repeater):
    - `number` (text)
    - `title` (text)
    - `description` (textarea)
    - `icon_svg` (textarea)

- **Social Proof**
  - `stats_jobs` (text, default: "1,200+")
  - `stats_rating` (text, default: "4.9★")
  - `stats_years` (text, default: "6 Years")
  - `stats_veteran` (text, default: "100%")

- **FAQ Teaser**
  - `faqs` (repeater):
    - `question` (text)
    - `answer` (textarea)

- **Final CTA**
  - `final_cta_headline` (text)
  - `final_cta_subhead` (text)
  - `final_cta_primary_text` (text)
  - `final_cta_primary_url` (URL)

### Field Group 2: Global Settings (ACF Options Page)

**Location:** Options page

**Fields:**

- **Contact Info**
  - `phone_number` (text)
  - `email_address` (email)
  - `facebook_url` (URL)
  - `address` (textarea)
  - `hours` (textarea)

- **Trust Elements**
  - `veteran_owned_badge` (true/false)
  - `years_in_business` (number)
  - `jobs_completed` (number)
  - `google_rating` (number, 0-5 scale)

- **Pricing**
  - `base_price` (text)
  - `rental_period_days` (number)
  - `loading_service_price` (text)

---

## 🔍 SCHEMA MARKUP IMPLEMENTATION

### LocalBusiness Schema (Home Page)

**Add via Yoast/Rank Math OR custom JSON-LD:**

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Dumpster Duff's",
  "image": "https://dumpsterduffs.com/logo.png",
  "priceRange": "$$",
  "telephone": "+1-573-356-4272",
  "email": "dustin@dumpsterduffs.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Columbia",
    "addressRegion": "MO",
    "postalCode": "65201",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "38.9517",
    "longitude": "-92.3341"
  },
  "areaServed": [
    { "@type": "City", "name": "Columbia" },
    { "@type": "City", "name": "Jefferson City" },
    { "@type": "City", "name": "Fulton" }
  ],
  "openingHours": "Mo-Fr 07:00-18:00, Sa 08:00-14:00",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "247"
  }
}
```

### Service Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Dumpster Rental",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Dumpster Duff's"
  },
  "areaServed": {
    "@type": "State",
    "name": "Missouri"
  },
  "offers": {
    "@type": "Offer",
    "price": "299",
    "priceCurrency": "USD",
    "description": "15-yard dumpster rental for 3 days"
  }
}
```

### FAQPage Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does a dumpster rental cost in Missouri?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our 15-yard dumpster rental starts at $299 for up to 3 days..."
      }
    }
  ]
}
```

**Implementation:**

- Use Yoast FAQ block OR
- Add custom JSON-LD via `wp_head` hook:

```php
// functions.php
function add_faq_schema() {
    if (is_page('faq')) {
        // Output FAQ schema JSON-LD
    }
}
add_action('wp_head', 'add_faq_schema');
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Launch

- [ ] All plugins installed and activated
- [ ] ACF field groups created
- [ ] All pages created (Home, Sizes & Pricing, How It Works, Service Areas, Contractors, About, Contact, FAQ)
- [ ] Service Area CPT populated (12+ cities)
- [ ] Reviews CPT populated (10+ reviews)
- [ ] Navigation menus configured
- [ ] Footer widgets configured
- [ ] Contact forms tested (Gravity Forms)
- [ ] Square Appointments integration tested
- [ ] Mobile responsive check (all breakpoints)
- [ ] Speed test (target: <2s, 90+ Lighthouse)
- [ ] Schema markup validated (Google Rich Results Test)

### On Launch

- [ ] SSL certificate active
- [ ] www → non-www redirect (or vice versa)
- [ ] 301 redirects from old site URLs
- [ ] Google Search Console configured
- [ ] Google Analytics + GTM installed
- [ ] Google My Business verified
- [ ] Sitemap submitted to Google
- [ ] Bing Webmaster Tools configured
- [ ] Backup system active (UpdraftPlus or host backup)
- [ ] Security plugin configured (Wordfence/Sucuri)

### Post-Launch (Week 1)

- [ ] Monitor form submissions (test email delivery)
- [ ] Check Google Search Console for crawl errors
- [ ] Install heatmap tool (Hotjar/Microsoft Clarity)
- [ ] Set up Google Ads conversion tracking (if running ads)
- [ ] Monitor site speed (PageSpeed Insights)
- [ ] Request customer reviews (email campaign)

---

## 💰 COST ESTIMATE

### One-Time Costs

- **Domain:** $15/year (if new domain)
- **SSL Certificate:** $0 (included with host)
- **Theme:** $0-129 (Kadence Pro optional)
- **ACF Pro:** $49/year
- **Gravity Forms:** $59-159/year
- **WP Rocket:** $49/year
- **Development:** $3,000-6,000 (40-60 hours @ $75-100/hr)

**Total One-Time:** ~$3,200-6,500

### Recurring Annual Costs

- **Hosting:** $300-1,200/year (Kinsta: ~$350/year for starter)
- **Domain:** $15/year
- **Plugins:** ~$200/year (ACF, Gravity Forms, WP Rocket)
- **Zapier:** $0-240/year (if using Square integration)
- **Maintenance:** $500-2,000/year (updates, backups, monitoring)

**Total Annual:** ~$1,000-3,700/year

---

## 📞 HANDOFF TO CLIENT

### What Client Can Edit (No Developer Needed)

- ✅ All page content (via ACF fields in page editor)
- ✅ Add/edit reviews (custom post type)
- ✅ Add/edit service areas (custom post type)
- ✅ Add/edit FAQs (repeater field)
- ✅ Change phone number/email (theme customizer or ACF options)
- ✅ Upload new hero images
- ✅ Edit navigation menus
- ✅ Add blog posts

### What Requires Developer

- ⚠️ Theme updates (major design changes)
- ⚠️ New page templates
- ⚠️ Plugin configuration
- ⚠️ Schema markup changes
- ⚠️ Square integration changes

### Training Deliverables

- [ ] Video walkthrough: How to edit homepage sections
- [ ] Video: How to add a review
- [ ] Video: How to add a service area
- [ ] PDF: ACF field reference guide
- [ ] PDF: Common tasks checklist

---

**Next Steps:** Reference this guide during WordPress build phase. Questions? Refer to README.md for full project context.
