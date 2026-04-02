# Changelog

All notable changes to this project will be documented in this file.

<!-- Generated from git history on 2026-04-02 -->

## [Unreleased]


## [2026-03] - 2026-03-01

### Added
- Dropdown nav + consistent PageHero styling across all pages
- Dark mode toggle, admin improvements, announcement banner, cookie consent, back to top, 404, loading, bulk actions, audit log, settings expansion
- Dark mode + fix besok-oss page hero
- Rebuild Program from WordPress structure (Buddhism/Mindfulness/Yoga)
- Add SQL import script for 54 WordPress blog posts
- Render EventJsonLd structured data on event detail page
- Expand WP redirect map to cover all 201 WordPress slugs
- Add event_category_assignments junction table and update events to use it
- Add MediaPicker component and integrate into blog editor
- Complete SEO — remaining page metadata, favicons, web manifest
- Comprehensive SEO — sitemap, robots.txt, structured data, per-page metadata
- Admin media library shows ALL images — filesystem scan + DB uploads
- Complete WP media library import — 149 images (148MB) from API + page scrape
- Import full WordPress media library (70 images, 35MB) preserving year/month structure
- 17 rotating hero phrases (SV/EN) — presence, peace, empowerment, minimalist categories
- Admin media library (WordPress-style grid + upload + sharp optimization + thumbnails + delete) + 97 seasonal hero images with random rotation
- Seasonal hero images (12 months, Scandinavian nature from Unsplash) with auto-rotation

### Changed
- Enable compression + add WP media rewrites + remote image patterns
- Final summary: Tasks 1-6 complete
- Task 5: WP redirect map — middleware handles 60+ legacy WordPress URLs
- Tasks 3&4: Admin nav sidebar with role-based visibility, event_manager role in schema
- Task 2: Blog admin — list, new, edit pages with server actions
- Task 1: Blog system — DB-backed (posts table, bilingual SV/EN, generateMetadata)
- Optimize seasonal hero images — 54MB→29MB (mozjpeg q75, max 1920px)
- Redesign: site-wide update — gold/charcoal brand, Playfair+DM Sans typography, hero with seasonal rotation + circles motif, new nav/footer, category cards, mission section, support CTA
- Homepage redesign prototype with brand assets, gold+charcoal palette, circles motif

### Fixed
- Improve contrast on auth/account/checkout/events/program surfaces
- Dark-mode contrast for announcement/theme vars and membership cards
- Unblock workspace build for admin and pos apps
- Graceful DB fallbacks and dark-mode consistency on core pages
- Announcement banner positioning — fixed above nav, pushes content down
- CMS pages — dark mode, PageHero on front-end, View on Site links in admin
- Admin layout — hide public header/footer, fix sidebar position and content padding
- Admin layout (hide site nav) + dark mode toggle
- Unify page heading style + remove extra top spacing + fix program data
- Remove event_category_assignments subquery from events page (table not migrated yet)
- Escape apostrophe in bli-medlem metadata
- Include seasons images in deploy (only exclude wp-media)
- Responsive — remove hero double margin, fix mobile menu breakpoint gap (md→lg)
- Prevent horizontal scroll at html/body level
- Add top padding for fixed nav + prevent horizontal overflow
- Use prebuilt @img/sharp-linuxmusl-x64 binary — no more source build
- Add pnpm supportedArchitectures for linux-musl — sharp prebuilt binary instead of source build
- Add node-addon-api + node-gyp deps for sharp source build on Alpine
- Reorder Dockerfile base stage — apk install BEFORE corepack + cache bust v2
- Install vips-dev in base stage so all build stages have sharp native deps
- Remove static hero image fallback — use 1px transparent placeholder until seasonal JS loads
- Solid white nav background + create all missing pages (om-oss, kontakt, stod-oss, besok-oss, forsta-besoket, bli-volontar, lokalhyra, integritetspolicy, nyhetsbrev)
- Add vips/sharp native deps to Dockerfile for Alpine
- Try multiple paths for prototype.html in standalone
- Move prototype to /api/prototype to bypass i18n middleware

## [2026-02] - 2026-02-01

### Added
- Make Stripe keys editable in admin and use DB-backed Stripe config across checkout/webhooks/sync
- Featured-event checkbox/list in settings, support extra categories per event, homepage/events use managed featured list, and add admin media library upload
- Add editable Pages backend + public dynamic page rendering; featured events now respect WP featured flags; add WP page audit list
- Paginated order/payment/event history, B2C engagement insights, and Mailchimp API data on customer profile
- Add ticket booking CTA with member pricing display, featured-event surfacing, and manual customer creation
- Make user profile editable + add admin/member badges and user links across orders views
- Add optimized Unsplash blog cover images + homepage upcoming cards now show event image and full-card click-through
- Woo-style editable product detail screen with publish/inventory/pricing/taxonomy panels
- Add user-page search + global dashboard search across users/orders/events/products
- Stripe subscription checkout + webhook membership sync + member-included event defaults/settings
- Add commerce data quality panel + one-click Stripe sync action on dashboard
- Enrich user profile with sales/payments + add Stripe API payment sync endpoint
- Products admin (1,251 products from WP), public shop page with category filter, search, type filter
- Event detail page, category filter, past events toggle, iCal export, calendar view link
- Full TEC-style events management - venues CRUD, organizers CRUD, category/venue/organizer selectors on events, public calendar month view with day grid
- Full detail pages for events/users/orders/members - clickable, editable, with all DB fields, payments, registrations, order history
- Add Admin nav link in header + account page quick link
- Replace placeholder with DB-backed event management (create/publish/delete)
- Enforce server-side admin role guard on /admin routes
- Copy event images from WordPress and render on event cards
- Full user authentication system
- Stripe + Swish payments, checkout flow, membership page, feature gap analysis
- Admin sidebar layout, blog admin, events admin, individual blog post pages
- Complete site build - 5 blog posts, admin dashboard, events/blog pages, SQL data extraction
- Run db migrations on container startup

### Changed
- Remove emoji icons and introduce consistent custom SVG icon set across site/admin
- Group venues + organizers under Events in admin sidebar
- Render from database instead of hardcoded 6-card block
- Bump next from 14.2.35 to 15.5.10 (#1)
- Add lockfile and railway config
- Add full project specification

### Fixed
- Responsive events rendering + link members to user profile + user CRM/courses hub with Mailchimp quick link
- Calendar day/link correctness + homepage upcoming/membership now DB-backed to match events/member pages
- Fallback to Swedish content when English event title/description is missing
- Use 'Blog' in English menu/footer
- Mobile layout - move nav outside flex row, fix overflow, responsive sizing
- Remove non-existent capacity/priceSek columns from public events page (was causing 500)
- Replace ALL fake admin data with real DB queries (dashboard, users, orders, members, events)
- Remove priceSek from events insert (column doesn't exist), fix cookie secure flag, remove hardcoded admin sidebar stats
- Login form supports username/email and refreshes session after sign-in
- Replace broken thumbnail URL with real WP attachment images
- Allow login by username or email (case-insensitive)
- Dockerfile + real brand colors + real logo
- Remove favicon.ico from app/ dir to eliminate favicon.ico.json crash
- Add missing runtime dependencies (pg, bcryptjs, jsonwebtoken, nodemailer)
- Copy full .next/server dir in Dockerfile to fix favicon.ico.json crash
- Add root app/layout.tsx and favicon.ico to fix favicon.ico.json crash
- Rename Yeshe Norbu → Yeshin Norbu across entire codebase
- Re-extract PMPro/TEC events with correct column mappings
- Mobile hamburger menu, homepage with real content, improved footer
- Add POS login route and fix turbo/next compat issues (#2)
- Favicon.ico + next-intl requestLocale migration
- Update CI/deploy workflows — Railway auto-deploy, CI with continue-on-error
- Replace hetzner deploy workflow with railway deploy
- Switch to bcryptjs (pure JS, no native deps) for Railway deploy
- Switch from argon2 to bcrypt for alpine linux compatibility

