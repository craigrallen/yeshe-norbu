# Yeshin Norbu — Full Site Rebuild Specification
**Version:** 1.0  
**Date:** 2026-02-26  
**Status:** Draft for review  
**Author:** Claw (OpenClaw)

---

## 1. Project Overview

### 1.1 Mission
Rebuild yeshinnorbu.se as a modern, fast, beautiful, and fully custom web platform for Yeshin Norbu — an FPMT-affiliated Buddhist centre in Stockholm. The new site must feel unmistakably Scandinavian in its clarity and restraint, while carrying the warmth and spirit of FPMT Buddhist tradition.

### 1.2 Hard Constraints (Non-Negotiable)
- **Branding**: Logo, organisation name ("Yeshin Norbu"), and brand colours stay exactly as-is
- **Payments**: Stripe (cards, Apple/Google Pay) and Swish (Swedish mobile payments) are the only permitted payment gateways — for both online AND in-person sales
- **Language**: Swedish is the primary language; English is an automated secondary option
- **Hosting**: EU-based data residency required
- **Compliance**: GDPR-compliant from Day 1
- **Sales audit trail**: Full immutable audit history of all transactions (online and in-person)
- **In-person sales**: Must support selling teachings, sessions, and merchandise at the physical venue

### 1.3 Creative Latitude
Everything else is open. We will build custom where it gives us a better result than off-the-shelf tools. No WordPress dependency. No plugin constraints. The goal is the best possible outcome.

---

## 2. Current State Summary (from live backend audit)

### 2.1 Platform
- WordPress 6.8.1 + Divi theme
- WooCommerce 10.5.2
- Swedish admin UI (sv_SE)

### 2.2 Key Data to Migrate
| Asset | Volume |
|---|---|
| Registered users | 1,190 |
| WooCommerce orders | 1,625 |
| Events | 162 |
| Membership plans | 3 active (Friend Annual, Non-Profit Yearly, Mental Gym Card Monthly) |
| Members on active plans | ~90 |
| LearnDash courses | Present (courses, lessons, quizzes, certs, essays, assignments) |

### 2.3 Current Payment Gateways
- Stripe — active
- Swish Handel for WooCommerce — active
- PayPal Standard — inactive (not migrating)

### 2.4 Current Plugins (relevant to functionality)
- The Events Calendar Pro — event + ticket management
- WooCommerce Memberships + Subscriptions
- LearnDash LMS
- WCML (WooCommerce Multilingual / WPML)
- WPForms
- Rank Math SEO
- Wordfence
- WP Mail SMTP
- Promoter (email marketing)

### 2.5 Key Gaps in Current Site
- Language direction is wrong (English primary, Swedish secondary — must flip)
- Zero 2FA adoption across all 1,190 users
- Divi is heavy and slow; not component-based
- Plugin sprawl with overlapping functionality
- No proper design system / brand token enforcement
- Craig's account lacks full admin access (permission issue to resolve)

---

## 3. Recommended Tech Stack

### 3.1 Philosophy
Build with modern, maintainable tools. Prefer custom-built where it gives us full control and a better UX. Use best-in-class libraries rather than monolithic platforms.

### 3.2 Frontend
| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 14** (App Router) | Fast, SEO-friendly, server components, great i18n support |
| Language | **TypeScript** | Type safety across the codebase |
| Styling | **Tailwind CSS** + CSS custom properties for brand tokens | Utility-first, fast to build, easy to enforce brand colours |
| Component library | **Custom design system** built on Radix UI primitives | Fully accessible, brand-faithful, no visual baggage from 3rd party libs |
| Animation | **Framer Motion** | Subtle, tasteful animations fitting the Scandinavian aesthetic |
| i18n | **next-intl** | Swedish primary, English secondary; URL-based locale routing (/sv/, /en/) |
| Forms | **React Hook Form** + Zod validation | Lightweight, type-safe, no dependencies |
| State management | **Zustand** (minimal) + React Query for server state | Simple, no Redux overhead |

### 3.3 Backend / API
| Layer | Choice | Rationale |
|---|---|---|
| API layer | **Next.js API routes** (serverless) for simple ops; **separate Node.js/Fastify service** for heavy workloads (event registrations, payment webhooks) | Keeps frontend and backend cleanly separated |
| CMS / Content | **Payload CMS v3** (self-hosted, headless) | TypeScript-native, custom fields, fully owned, no SaaS fees, excellent admin UI |
| Database | **PostgreSQL** (via Neon or self-hosted on EU server) | Relational, battle-tested, perfect for orders/events/users |
| ORM | **Drizzle ORM** | Type-safe, lightweight, works perfectly with Postgres |
| Auth | **Custom auth** using JWT + refresh tokens, or **Better Auth** | Full control, no SaaS dependency, GDPR-friendly |
| File storage | **Cloudflare R2** (EU bucket) or **MinIO** self-hosted | S3-compatible, cheap, EU data residency |
| Email | **Resend** (transactional) + custom HTML templates in Swedish/English | Reliable, modern API, easy to template |
| Search | **Meilisearch** (self-hosted or Meilisearch Cloud EU) | Fast, typo-tolerant, powers event/course/content search |

### 3.4 Payments
| Gateway | Implementation |
|---|---|
| **Stripe** | Stripe Payment Intents + Checkout Sessions; webhooks for order/subscription lifecycle; Stripe Customer Portal for subscription management |
| **Swish** | Direct Swish Merchant API (or via Nets/Bambora as gateway) — M-Commerce and E-Commerce flows; webhook callbacks for payment confirmations |

### 3.5 Events and Ticketing
**Custom-built** event and ticketing system (not The Events Calendar). Reasons:
- Full control over UX, ticket types, pricing rules, and discount logic
- No plugin licensing fees
- Can model exactly what Yeshin Norbu needs (retreats, day teachings, multi-session courses, live streaming events)
- Tightly integrated with Stripe + Swish from the ground up

### 3.6 Courses / Learning (LMS)
**Custom-built** lightweight LMS module within Payload CMS + Next.js. Reasons:
- LearnDash is overkill and expensive for the scale here
- Custom LMS = exactly the features needed, no more
- Progress tracking, quizzes, certificates — all buildable in ~2 sprints
- Fully integrated with membership/subscription tiers

### 3.7 Infrastructure and Hosting
| Layer | Choice |
|---|---|
| Hosting (app) | **Hetzner Cloud** (EU, Germany/Finland) — excellent price/performance, GDPR-compliant |
| Hosting alt | **Render** (EU region) or **Railway** (EU) — simpler DevOps |
| Database | **Neon Postgres** (EU region) or Hetzner-hosted Postgres |
| CDN | **Cloudflare** (free tier covers most needs; EU data handling) |
| CI/CD | **GitHub Actions** → deploy to Hetzner via Docker Compose or direct |
| Staging | Dedicated staging environment on same infra stack |
| Backups | Daily Postgres dumps to Cloudflare R2; media backups to same |
| SSL | Cloudflare or Let's Encrypt (auto-renewing) |

---

## 4. Design System

### 4.1 Design Philosophy
> **Modern Scandinavian calm, infused with FPMT warmth.**

- Generous whitespace — let content breathe
- Restrained colour usage — brand palette leads, neutrals support
- Clean, readable typography — Swedish-first, long-form friendly
- Warm photography — natural light, human moments, meditation spaces
- Subtle Buddhist motifs — used with taste, not decoration overload
- No clutter — every element earns its place

### 4.2 Brand Tokens (to be extracted from current site)
```
--color-primary:       [current brand gold/yellow — to confirm exact hex]
--color-secondary:     [dark charcoal/grey from current site]
--color-accent:        [warm ochre/burnt orange hints]
--color-surface:       #FFFFFF
--color-background:    #F9F7F4  (warm off-white, Scandinavian feel)
--color-text-primary:  #1A1A1A
--color-text-muted:    #6B6B6B
--color-border:        #E5E1DC
```

### 4.3 Typography
- **Headings**: Inter or Söhne (clean, modern, Scandinavian-adjacent) — or keep existing if defined
- **Body**: System font stack or Inter for performance
- **Scale**: Fluid type scale (clamp-based) for responsive sizing
- **Swedish hyphenation**: enabled via CSS `hyphens: auto` for long Swedish compound words

### 4.4 Component Library (custom)
Built on Radix UI primitives, styled with Tailwind:
- Button (primary, secondary, ghost, danger)
- Card (event card, course card, content card)
- Modal / Dialog
- Form inputs (text, select, checkbox, radio, date picker)
- Badge / Tag
- Notification / Toast
- Navigation (desktop + mobile)
- Event ticket widget
- Donation widget
- Membership tier card
- Progress bar (for courses)
- Calendar/event grid

### 4.5 Page Templates
- Home (hero, upcoming events, mission, ways to get involved, latest news)
- Events calendar (grid + list views, filter by category/date)
- Single event (details, tickets, map, share)
- Courses catalogue
- Single course (modules, progress, enroll CTA)
- Library (search, filter, media types)
- Donate (one-time + recurring, Stripe + Swish)
- Memberships (tier comparison, sign up)
- About us
- Community
- Venue hire (enquiry form)
- Blog / News
- Account dashboard (orders, membership, course progress, saved payments)
- Checkout (Stripe + Swish)
- Admin console (see Section 6)

---

## 5. Feature Specification

### 5.1 Localisation
- **Swedish** as default locale (URL: `/` or `/sv/`)
- **English** as secondary locale (URL: `/en/`)
- Language switcher in header
- All content, emails, receipts, and UI strings available in both languages
- Swedish SEO: hreflang tags, Swedish sitemap, Swedish meta descriptions
- Translation workflow: content editors can translate per-field in Payload CMS admin

### 5.2 Authentication and User Accounts
- Email + password registration (with email verification)
- Social login optional (Google) — to be decided
- Secure password reset via email
- 2FA via TOTP (authenticator app) — mandatory for admin/editor roles, optional for customers
- User profile: name, email, address, language preference, consent flags
- Account dashboard: order history, membership status, course progress, saved payment methods (via Stripe Customer Portal)
- GDPR: data export button, account deletion request

### 5.3 Events and Ticketing
**Custom-built module.**

Event fields:
- Title (sv + en)
- Description (rich text, sv + en)
- Category (Buddhism, Mindfulness, Meditation, Retreat, Live, etc.)
- Start / End datetime (with timezone)
- Venue (address, map embed, or "online")
- Capacity (per ticket type)
- Featured image + gallery
- Teachers/speakers (linked profiles)
- Related events

Ticket types per event:
- Name (e.g. Standard, Concession, Non-Profit, Early Bird)
- Price (SEK)
- Capacity limit
- Sale window (open from / close at)
- Discount codes (percentage or fixed)
- Waitlist (if capacity full)

Checkout flow:
- Select tickets → attendee details → payment (Stripe or Swish) → confirmation email
- Confirmation: booking ref, QR code for check-in, calendar add (ICS)
- Attendee management: admin can view/export attendees per event
- Check-in: QR scan or manual name lookup at door

Live / online events:
- Optional streaming link field (Zoom, YouTube, etc.) — revealed to registered attendees only

### 5.4 Payments — Stripe
- Payment Intents API for one-time payments (events, donations, course purchases)
- Stripe Checkout Sessions for complex flows
- Stripe Customer Portal for subscription management (cancel, upgrade, update card)
- Stripe Subscriptions for recurring memberships and donations
- Webhooks: payment_intent.succeeded, payment_intent.payment_failed, checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.paid, invoice.payment_failed
- Receipts: auto-generated, branded, in Swedish (with English toggle), emailed via Resend
- Refunds: admin can initiate via admin console; Stripe refund API

### 5.5 Payments — Swish
- Swish E-Commerce API (for web checkout, QR code payment)
- Swish M-Commerce API (for mobile deep-link, opens Swish app directly)
- Callback URL handling for payment confirmation
- Order status update on confirmed Swish payment
- Receipts: same flow as Stripe (emailed via Resend)
- Swish available for: events, donations, one-time memberships (not recurring — Swish doesn't support subscriptions)

### 5.6 Donations
- One-time donations: Stripe (card) + Swish
- Recurring donations: Stripe Subscriptions (monthly/yearly)
- Suggested amounts + custom amount input
- Dedication/intention field (optional message)
- Receipts with org details for tax purposes
- Donor management in admin: list, export, filter by amount/date/gateway
- Anonymous donation option

### 5.7 Memberships and Subscriptions
**Custom-built on top of Stripe Subscriptions.**

Membership tiers (based on current data):
- Friend Annual (currently 1 member)
- Non-Profit Yearly (currently 85 members)
- Mental Gym Card Monthly (currently 4 members)
- (New tiers to be defined by Craig)

Membership features:
- Access control for gated content (courses, library items, event discounts)
- Upgrade/downgrade between tiers
- Membership card (digital, downloadable PDF)
- Renewal reminders via email (30 days, 7 days, day-of)
- Admin: view all members, filter by tier, export, manually grant/revoke

### 5.8 Courses / LMS
**Custom-built lightweight LMS.**

Course structure:
- Course (title, description, featured image, category, instructor)
  - Modules (sections)
    - Lessons (video, audio, text, PDF)
    - Quizzes (multiple choice, true/false)
    - Assignments (text submission)
  - Certificate (auto-generated PDF on completion)

Progress tracking:
- Per-user progress per lesson/module/course
- Completion percentage displayed on course card and dashboard
- Certificate unlocked on 100% completion

Access control:
- Free courses (open to all or registered users)
- Paid courses (one-time purchase via Stripe/Swish)
- Membership-gated courses (access granted by membership tier)

### 5.9 Point of Sale (In-Person Sales)
**Custom-built POS module** — runs in the browser on a tablet or laptop at the venue.

**What it covers:**
- Sell event tickets at the door (walk-ins, last-minute)
- Sell course enrollments, memberships, and merchandise in person
- Sell one-off sessions and private teachings

**Payment methods at POS:**
- **Stripe Terminal** — card reader (Stripe BBPOS WisePOS E or similar), tap/chip/PIN, Apple/Google Pay contactless
- **Swish** — show QR code on screen; customer scans with Swish app; callback confirms payment
- **Cash** — manual entry (cash amount received, change calculated); recorded in the system for audit trail
- **Complimentary / gift** — mark a sale as comped with a reason field (logged for audit)

**POS UI (tablet-optimised):**
- Product/event/membership quick-select grid
- Customer lookup (by name, email, or phone) or guest checkout
- Cart view with line items, discounts, totals
- Payment method selection (Card / Swish / Cash / Comp)
- Receipt: print (if printer connected) or email/SMS to customer
- Offline mode: queue transactions locally if internet drops; sync on reconnect

**POS roles:**
- Cashier (can process sales, no refunds)
- Manager (can process sales + refunds + discounts)
- Admin (full access including day-end reports)

**Day-end reconciliation:**
- Cash drawer summary (opening float, sales, expected close)
- Transaction list for the session (all methods)
- Export daily takings report (CSV / PDF)

**Hardware:**
- Stripe Terminal card reader (Stripe handles certification)
- Optional: receipt printer (Epson TM-T20 or similar, via Stripe Terminal or direct)
- Tablet or laptop as the POS terminal (any modern browser)

---

### 5.10 Sales Audit Trail
**Full immutable audit history across all sales channels (online + in-person).**

**What is logged (every transaction):**
- Transaction ID (internal + gateway reference)
- Timestamp (UTC + Stockholm local time)
- Channel: Online / POS / Admin-manual
- Payment method: Stripe card / Swish / Cash / Comp / Refund
- Items purchased (name, quantity, unit price, line total)
- Customer (user ID if logged in, or name/email for guest)
- Staff member who processed (for POS and admin-manual transactions)
- Gross amount, discount applied, net amount, currency (SEK)
- Gateway status (succeeded, pending, failed, refunded)
- Refund details (if applicable): amount, reason, processed by, timestamp
- IP address (for online transactions)
- Notes field (optional free text, e.g. "Walk-in retreat attendee")

**Audit log properties:**
- **Immutable**: records cannot be edited or deleted — only supplemented (e.g. refund added as a new record referencing the original)
- **Append-only**: implemented via DB trigger or application-level enforcement
- **Exportable**: filter by date range, channel, payment method, staff member, product — export CSV/Excel/PDF
- **Role-gated**: Finance and Admin roles can view full audit trail; Cashier sees only their own session

**Reports available in admin:**
- Daily sales summary (by channel and payment method)
- Monthly revenue report (events, memberships, donations, courses, POS — broken down)
- Per-event revenue (total tickets sold, revenue, refunds)
- Per-course enrollment revenue
- Membership revenue (new, renewals, cancellations)
- Donation history (by donor, by period, recurring vs one-time)
- Refund report (by period, by reason, by staff member)
- Reconciliation report (Stripe settlements vs internal records; Swish settlements vs internal records; Cash vs internal records)
- Year-end export (for accounting / Swedish tax authority / Skatteverket)

---

### 5.12 Library
- Articles (text + images)
- Videos (YouTube/Vimeo embed or hosted)
- Audio (teachings, meditations, podcasts)
- PDFs (downloadable)
- Filter by: category, teacher, media type, language
- Search powered by Meilisearch
- Gated content: some items members-only or purchase-required

### 5.13 Venue Hire
- Description page with photos, capacity, pricing
- Enquiry form (WPForms → replaced with custom form → Resend email)
- Calendar availability (basic — admin manages blocked dates)

### 5.14 Newsletter and CRM
- Email capture on site (footer, event pages, donation thank-you pages)
- Consent flags (GDPR opt-in, tracked in DB)
- Integration with **Resend** for transactional emails
- Integration with **Loops** or **Listmonk** (self-hosted) for newsletters
- Segmentation: by membership tier, event attendance, course enrollment

### 5.15 SEO and Analytics
- Rank Math → replaced by custom Next.js metadata + JSON-LD structured data
- Schema.org: Event, Organization, Course, Article, BreadcrumbList
- Sitemap: auto-generated in Swedish + English
- hreflang tags for bilingual SEO
- Analytics: **Plausible Analytics** (EU-hosted, GDPR-friendly, no cookies) or **Umami** self-hosted
- Google Search Console integration

---

## 6. Admin Console

### 6.1 Design Principles
- Clean, fast, purpose-built for Yeshin Norbu staff
- Role-based access: Admin, Editor, Finance, Support
- Swedish UI (with English toggle)
- Mobile-friendly for on-the-go event management

### 6.2 Sections

**Dashboard**
- Today's events and attendee count
- Recent orders / donations
- Membership stats (active, expiring soon, lapsed)
- Revenue summary (Stripe + Swish, current month)
- Quick actions: Create event, Add post, View orders

**Content**
- Pages (CRUD, rich text editor, SEO fields, publish/draft/schedule)
- Posts / News (blog)
- Library items (articles, videos, audio, PDFs)
- Media library (upload, tag, search)
- Menus (header nav, footer nav)
- Global settings (site name, tagline, footer text, social links)

**Events**
- Event list (filter by date/category/status)
- Create/edit event (full field editor)
- Ticket types manager
- Attendees list per event (search, filter, export CSV)
- Check-in tool (scan QR or manual tick-off)
- Discount codes manager

**Courses**
- Course list (filter by category/instructor/access type)
- Create/edit course (modules, lessons, quizzes, assignments)
- Enrollment list per course (user, progress %, enrollment date)
- Certificate templates

**Donations**
- Donation list (filter by date, amount, gateway, recurring/one-time)
- Donor details and history
- Export (CSV/Excel) for accounting
- Refund action (triggers Stripe refund)

**Memberships**
- Member list (filter by tier, status, expiry date)
- Membership tier manager (create/edit tiers, Stripe product/price IDs)
- Grant/revoke membership manually
- Bulk email to tier

**Orders / Payments**
- All orders across events, courses, donations
- Filter by: user, gateway (Stripe/Swish), status, date range
- Individual order detail with refund action
- Stripe webhook log
- Swish callback log

**Users**
- User list (search, filter by role, membership tier, 2FA status)
- User detail: orders, memberships, course progress, GDPR data export, account deletion
- Role management
- 2FA enforcement settings

**Email**
- Sent email log (transactional)
- Email template editor (receipts, membership renewal, event confirmation, etc.)
- Newsletter segments and send log

**Settings**
- Branding: logo upload, colour tokens (locked to brand invariants), typography settings
- Payment gateways: Stripe keys (test/live), Swish credentials, webhook endpoints
- Email: Resend API key, from address, reply-to
- Localization: default language, translation completeness overview
- Security: 2FA enforcement rules, admin IP allowlist, session timeout
- Integrations: Plausible/Umami analytics, Meilisearch, Cloudflare

---

## 7. Data Migration Plan

### 7.1 What We're Migrating
| Data | Source | Target |
|---|---|---|
| Users (1,190) | WP `wp_users` + `wp_usermeta` | Custom `users` table |
| Orders (1,625) | WooCommerce `wp_posts` (shop_order) + `wp_postmeta` | Custom `orders` table |
| Memberships (~90 active) | WooCommerce Memberships tables | Custom `memberships` table |
| Subscriptions | WooCommerce Subscriptions tables | Stripe Subscriptions (migrated) |
| Events (162) | The Events Calendar `wp_tribe_*` tables | Custom `events` table |
| Event registrations | Tribe Tickets tables | Custom `event_registrations` table |
| Courses | LearnDash `wp_posts` (sfwd-*) + `wp_usermeta` (progress) | Custom `courses` / `enrollments` tables |
| Media | WP uploads directory | Cloudflare R2 EU bucket |
| Pages / Posts / Library | WP `wp_posts` (pages, posts) | Payload CMS content |
| Settings | WP options table (keys) | New site settings |

### 7.2 Migration Approach
1. **Export scripts**: WP-CLI + custom PHP export scripts to JSON/CSV
2. **Data cleaning**: deduplicate users, normalize dates/currencies, flag anomalies
3. **Mapping**: define field-by-field mapping from old schema to new schema
4. **Import scripts**: TypeScript migration scripts using Drizzle ORM to populate new DB
5. **Stripe migration**: existing Stripe customers can be referenced by email; subscriptions migrated or recreated
6. **Validation**: row count checks, spot-check samples, test order history access
7. **URL mapping**: generate 301 redirect map for all changed URLs

### 7.3 GDPR Data Export
- Before migration: export full dataset from current WP site
- Archive securely (encrypted) as the source-of-truth backup
- Post-migration: verify data export tools work end-to-end on new site
- Purge old site data after migration sign-off by Craig

### 7.4 URL Continuity
Key URL patterns to map:
```
/event/*           → /evenemang/*  (or /events/* with Swedish redirect)
/product/*         → /kurser/* or /evenemang/*
/shop/*            → /kassa/*
/my-account/*      → /mitt-konto/*
/donate-2/         → /donera/
/join-us-2/        → /bli-medlem/ or /stod-oss/
/whats-on-2/       → /program/
/venue-hire-2/     → /lokalhyra/
```

---

## 8. GDPR and Privacy

### 8.1 Data Minimization
- Collect only what is needed for each feature
- No marketing cookies without explicit consent
- Stripe handles PCI — no raw card data on our servers
- Swish transactions: store confirmation reference only

### 8.2 Consent Management
- Cookie consent banner (custom, lightweight — no OneTrust fees needed)
- Separate consents: functional (required), analytics (optional), marketing (optional)
- Consent stored in DB per user, timestamped

### 8.3 Data Subject Rights (automated)
- **Right of access**: user dashboard → "Download my data" (JSON export of all personal data)
- **Right to erasure**: user or admin → "Delete my account" → anonymize orders (keep for accounting), delete personal fields
- **Right to rectification**: user can edit profile fields
- **Data portability**: JSON/CSV export

### 8.4 Data Processing
- All data stored in EU (Hetzner Frankfurt or Helsinki)
- Data Processing Agreement (DPA) with Stripe, Resend, Cloudflare
- Privacy policy and cookie policy in Swedish (primary) and English

### 8.5 Security
- 2FA mandatory for all admin/editor accounts
- Passwords hashed with bcrypt/argon2
- HTTPS everywhere (HSTS)
- Rate limiting on auth endpoints
- SQL injection protection via Drizzle ORM parameterized queries
- XSS protection via React's default escaping + CSP headers
- Regular dependency audits (Dependabot or equivalent)
- Automated security scans in CI

---

## 9. Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 mobile, ≥ 95 desktop |
| LCP (Largest Contentful Paint) | < 2.5s |
| FID / INP | < 100ms |
| CLS | < 0.1 |
| Time to First Byte | < 200ms (EU users) |
| Image optimization | Next.js Image component, WebP/AVIF, lazy loading |
| Core Web Vitals | All green |

---

## 10. Accessibility

- WCAG 2.1 AA compliance target
- Semantic HTML throughout
- ARIA roles and labels on all interactive elements
- Keyboard navigable (tab order, focus styles)
- Screen reader tested (NVDA + VoiceOver)
- Color contrast ratios checked against brand palette
- Swedish-language accessibility: `lang="sv"` attribute, proper hyphens

---

## 11. Build Phases and Milestones

### Phase 0 — Foundation (Weeks 1–2)
- [ ] Repo setup (GitHub, monorepo with Next.js frontend + Payload CMS + API service)
- [ ] Design system scaffolding (Tailwind config with brand tokens, Radix UI setup)
- [ ] Postgres DB schema design (users, events, orders, memberships, courses, content)
- [ ] Payload CMS setup (content types: pages, posts, events, courses, library items)
- [ ] Auth system (registration, login, JWT, refresh tokens, 2FA scaffolding)
- [ ] Stripe integration (test mode: products, checkout, webhooks)
- [ ] Swish integration (test mode: E-Commerce flow, callback handler)
- [ ] EU hosting provisioned (Hetzner), staging environment live
- [ ] CI/CD pipeline (GitHub Actions → staging auto-deploy)

### Phase 1 — Core Public Site (Weeks 3–5)
- [ ] Home page (bilingual, brand-faithful, FPMT/Scandinavian design)
- [ ] About, Community, Venue Hire pages
- [ ] Events calendar + single event page (Swedish primary)
- [ ] Event ticket checkout (Stripe + Swish, bilingual)
- [ ] Blog / News (Payload CMS content)
- [ ] Library (articles, videos, audio — basic)
- [ ] Search (Meilisearch integration)
- [ ] Language switcher + i18n routing (/sv/, /en/)
- [ ] SEO metadata, sitemap, hreflang
- [ ] Analytics (Plausible)

### Phase 2 — Payments, Memberships, Donations (Weeks 6–8)
- [ ] Donations page (one-time + recurring, Stripe + Swish)
- [ ] Membership tiers + sign-up flow (Stripe Subscriptions)
- [ ] Stripe Customer Portal (subscription management)
- [ ] User account dashboard (orders, membership, receipts)
- [ ] Email receipts (Swedish + English, via Resend)
- [ ] GDPR data export + account deletion

### Phase 3 — Courses / LMS (Weeks 9–11)
- [ ] Course catalogue + single course page
- [ ] Module/lesson viewer (video, text, audio, PDF)
- [ ] Quizzes + progress tracking
- [ ] Course enrollment (free / paid / membership-gated)
- [ ] Certificate generation (PDF)
- [ ] Enrollment dashboard in user account

### Phase 4 — Admin Console (Weeks 10–12, parallel)
- [ ] Admin dashboard + quick-action widgets
- [ ] Content manager (pages, posts, media)
- [ ] Event manager + attendee management + check-in tool
- [ ] Donation manager + export
- [ ] Membership manager
- [ ] Order/payment manager + refunds
- [ ] User manager + GDPR tools
- [ ] Email template editor
- [ ] Settings (branding, gateways, integrations)

### Phase 5 — Migration and Go-Live (Weeks 13–14)
- [ ] WP data export scripts
- [ ] Data cleaning and mapping
- [ ] Import scripts (users, orders, events, courses, memberships)
- [ ] Stripe customer/subscription migration
- [ ] Media migration to Cloudflare R2
- [ ] Content migration to Payload CMS
- [ ] 301 redirects configured
- [ ] Full QA (functional, payment flows, bilingual, mobile, accessibility)
- [ ] Staging sign-off by Craig
- [ ] DNS cutover + production go-live
- [ ] Post-launch monitoring (error rates, payment success rates, Core Web Vitals)

### Phase 6 — Post-Launch (Week 15+)
- [ ] Performance tuning
- [ ] SEO monitoring and adjustments
- [ ] User feedback and iteration
- [ ] Additional content (more library items, courses)
- [ ] Live event streaming integration (if needed)
- [ ] Newsletter / CRM integration expansion

---

## 12. Vendor Checklist

### Payments
- [ ] Stripe account (EU entity) — confirm live mode keys
- [ ] Stripe Webhooks endpoint registered (staging + production)
- [ ] Stripe Subscriptions: products and prices for all membership tiers and recurring donations
- [ ] **Stripe Terminal**: order at least one card reader (BBPOS WisePOS E recommended for Sweden); register location in Stripe Dashboard
- [ ] Stripe Terminal connection token endpoint implemented in API
- [ ] Swish Merchant account — confirm E-Commerce API credentials
- [ ] Swish M-Commerce (QR) flow tested for POS use case
- [ ] Swish test certificates + production certificates
- [ ] Swish callback URL registered

### Hosting and Infrastructure
- [ ] Hetzner Cloud account (Frankfurt or Helsinki region)
- [ ] Neon Postgres EU instance (or Hetzner Postgres)
- [ ] Cloudflare account (DNS + R2 bucket for media)
- [ ] GitHub organisation for the project repo
- [ ] Domain: yeshinnorbu.se DNS managed at Cloudflare

### Email
- [ ] Resend account — API key, domain verified (yeshinnorbu.se)
- [ ] SPF/DKIM/DMARC records for yeshinnorbu.se
- [ ] Email templates drafted (Swedish + English): order confirmation, event registration, membership welcome, membership renewal reminder, donation receipt, password reset

### Analytics
- [ ] Plausible Analytics (EU-hosted) — or self-hosted Umami
- [ ] Google Search Console (Swedish sitemap submitted)

### GDPR
- [ ] Privacy policy drafted (Swedish primary)
- [ ] Cookie policy drafted
- [ ] DPA with Stripe signed
- [ ] DPA with Resend signed
- [ ] DPA with Cloudflare reviewed
- [ ] DPA with Hetzner reviewed

### Security
- [ ] 2FA enforced for all admin accounts from Day 1
- [ ] Dependabot enabled on GitHub repo
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options, etc.)
- [ ] Rate limiting on auth endpoints

---

## 13. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Swish API integration complexity | Medium | High | Start Swish integration in Phase 0; allow 2 weeks for testing |
| Data migration data loss | Low | High | Full encrypted backup before migration; validation scripts; phased migration |
| Stripe subscription migration | Medium | Medium | Map all existing subscribers to new Stripe products; test cancellation/upgrade flows |
| Swedish SEO regression post-launch | Medium | Medium | 301 redirects, hreflang, sitemap submitted before DNS cutover |
| Craig account lacking full WP admin | Low | Low | Request WP superadmin access to complete data export |
| Plugin/content edge cases in migration | Medium | Medium | Thorough content audit before export; manual QA of spot-sampled records |
| Performance targets not met on mobile | Low | Medium | Performance budget enforced from Phase 0; Lighthouse in CI |

---

## 14. Open Questions (for Craig)

1. **Membership tiers**: Keep existing 3 tiers (Friend Annual, Non-Profit Yearly, Mental Gym Card Monthly) as-is, or redesign the tiers for the new site?
2. **Teachers/instructors**: Should teacher profiles be a content type (with bio, photo, events taught)?
3. **Live streaming**: Do online events need integrated streaming, or just a link field?
4. **Newsletter**: Which tool for bulk newsletters — Loops, Mailchimp, or self-hosted Listmonk?
5. **Custom domain emails**: Is transactional email to come from noreply@yeshinnorbu.se?
6. **Swish account**: Do you have an active Swish Merchant account, or does one need to be applied for?
7. **Full WP admin access**: Can you grant superadmin access to allow full data export from WP?
8. **Timeline**: Target go-live date?
9. **Budget**: Is there a fixed budget envelope for build + infra?
10. **Content volunteers**: Are there staff/volunteers who will manage content in the new admin?

---

*End of specification v1.0*
