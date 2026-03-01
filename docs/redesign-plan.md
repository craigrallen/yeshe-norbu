# Yeshin Norbu — Website Redesign Plan

## Current State (WordPress)
201 pages scraped. Many are duplicates, test pages, or WooCommerce system pages.
After filtering: **~60 real content pages** that map to about **25 distinct page types**.

---

## Proposed Site Architecture (Sitemap)

```
/                           → Homepage (hero + featured events + mission + CTAs)
├── /program                → Events calendar (filterable by category)
│   └── /program/[slug]     → Event detail + booking
├── /kurser                 → Courses overview (Buddhism, Mindfulness, Yoga)
│   ├── /kurser/buddhism           → Buddhist studies landing
│   │   ├── /kurser/discovering-buddhism
│   │   ├── /kurser/intermediate
│   │   └── /kurser/vajrayana
│   ├── /kurser/mindfulness        → Mindfulness & Compassion landing
│   ├── /kurser/yoga               → Yoga & Qigong landing
│   └── /kurser/see-learning       → SEE Learning (children's programme)
├── /om-oss                 → About Us
│   ├── /om-oss/larare             → Our Teachers (grid)
│   ├── /om-oss/var-larare         → Resident Teacher bio
│   └── /om-oss/foreningsinfo      → Association info + bylaws
├── /stod-oss               → Support Us (hub page)
│   ├── /bli-medlem                → Become a Member (Stripe)
│   ├── /mental-gym-kort           → Mental Gym Card (Stripe)
│   ├── /donationer                → Donate (Swish + Stripe + Dana)
│   ├── /bli-volontar              → Volunteer
│   ├── /bli-guardian              → Become a Guardian
│   └── /lediga-jobb               → Vacancies
├── /besok-oss              → Visit Us
│   ├── /forsta-besoket            → First Visit guide
│   ├── /cafe                      → Café & Library
│   └── /lokalhyra                 → Venue Hire
├── /butik                  → Shop
├── /blogg                  → Blog / News
├── /kontakt                → Contact (form + map)
├── /nyhetsbrev             → Newsletter signup
├── /integritetspolicy      → Privacy / GDPR
├── /forsaljningsvillkor    → Sales policy / Terms
├── /texter-och-boner       → Texts & Prayers
└── /konto                  → My Account
```

**25 page types** vs WordPress's 201 slugs. Much cleaner.

---

## Design Direction: 3 Options

### Option A — "Serene Modern" (Recommended)

Clean Scandinavian minimalism meets Buddhist warmth. Headspace meets a Stockholm design studio.

- **Colors**: Warm white (#FAFAF8) bg, deep saffron (#B8860B) accent, charcoal (#2D2D2D) text, sage green (#8FA98F) secondary
- **Typography**: Clean sans (Inter/DM Sans) body, elegant serif (Playfair Display) headings
- **Hero**: Full-width atmospheric photo with floating text + gentle parallax
- **Cards**: 16px rounded corners, subtle shadows, warm images
- **Nav**: Sticky, transparent on hero → white on scroll, mega-menu for Programme
- **Events**: Card grid with category color badges, date chips, member/non-member pricing
- **CTAs**: Saffron pill buttons with hover glow
- **Footer**: 4-column, newsletter signup, FPMT badge, address

### Option B — "Warm Community"

Approachable, colorful, community-focused. Modern yoga studio feel.

- **Colors**: Soft terracotta (#C4705A), cream (#FFF8F0) bg, plum (#5B3758) accent
- **Typography**: Rounded sans (Nunito), friendly and open
- **Hero**: Photo collage/mosaic of real community photos
- **Cards**: Soft pastel backgrounds per category
- **Events**: List view with large thumbnails, prominent booking buttons
- **CTAs**: Rounded with playful hover animations

### Option C — "Temple Digital"

Traditional Buddhist aesthetics, modern web. A digital temple.

- **Colors**: Deep burgundy (#6B1D2A) and gold (#C8A951) on off-white (#F5F1EB)
- **Typography**: Cormorant Garamond headings, clean sans body
- **Hero**: Slow video background (meditation, candles, prayer flags) with gold text
- **Cards**: Ornamental borders, subtle mandala patterns
- **Events**: Timeline layout, prayer flag category markers
- **CTAs**: Gold gradient buttons

---

## Component Library (shared)

- EventCard: image, title, date, category badge, price (member/non-member), CTA
- CourseCard: image, title, level, duration, next session
- TeacherCard: photo, name, title, short bio
- PricingCard: plan name, price, features, Stripe CTA
- HeroSection: full-width image/video, overlay text, CTAs
- CategoryNav: horizontal scrollable filter pills
- BilingualToggle: SV/EN in top nav
- NewsletterSignup: email + Mailchimp subscribe
- ContactForm: server action form
- MemberBadge: shows member savings

---

## Content Migration (4-week phased)

**Week 1 — Core**: Homepage, About Us, Teachers, Contact, First Visit, Privacy/Terms
**Week 2 — Programme**: Buddhism, Mindfulness, Yoga, SEE Learning landing pages
**Week 3 — Commerce**: Membership, Mental Gym Card, Donations, Volunteer, Venue Hire, Shop
**Week 4 — Community**: Blog, Newsletter, Texts & Prayers, Library/Café

All 201 WP slugs get redirect map → new slugs.

---

## Still Need From WordPress

- Full page content (HTML body) for ~60 real pages
- Teacher profiles (names, bios, photos)
- Event categories with descriptions
- Product listings from WooCommerce
- Media library images (logos, teacher photos, venue photos)
- Membership plan details and pricing
- Any form configurations

---

## Questions for Craig

1. Pick a design direction (A, B, C, or mix)
2. Do you have WP database access? (SSH/WP-CLI/phpMyAdmin)
3. Have high-res photos of centre/teachers/events, or use Unsplash stock?
4. Priority order for pages to go live?
5. Want me to build a visual prototype of the homepage?
