# Yeshe Norbu

Modern web platform for [Yeshe Norbu](https://yeshinnorbu.se) — an FPMT-affiliated Buddhist centre in Stockholm.

## Tech Stack

- **Frontend:** Next.js 14 (App Router, TypeScript strict mode)
- **Styling:** Tailwind CSS + custom design system (Radix UI primitives)
- **i18n:** next-intl (Swedish primary, English secondary)
- **CMS:** Payload CMS v3 (self-hosted)
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Custom JWT + TOTP 2FA + RBAC
- **Payments:** Stripe (cards, subscriptions, Terminal) + Swish (E-Commerce, M-Commerce)
- **Email:** Resend + React Email templates
- **Search:** Meilisearch
- **Hosting:** Hetzner Cloud (EU), Cloudflare CDN
- **CI/CD:** GitHub Actions → Docker → Hetzner

## Monorepo Structure

```
├── apps/
│   ├── web/          # Public website (Next.js)
│   ├── admin/        # Payload CMS admin
│   └── pos/          # Point of Sale (tablet-optimised)
├── packages/
│   ├── ui/           # Design system (Radix + Tailwind)
│   ├── db/           # Drizzle schema + migrations
│   ├── auth/         # JWT, Argon2, TOTP, RBAC
│   ├── payments/     # Stripe + Swish
│   └── email/        # Resend + React Email templates
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment
cp apps/web/.env.example apps/web/.env.local

# Start database
docker compose up postgres meilisearch -d

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start development
pnpm dev
```

## Key Features

- **Events & Ticketing** — Custom event management with ticket types, discount codes, QR check-in
- **Memberships** — Stripe Subscriptions with 3 tiers (Friend, Non-Profit, Mental Gym)
- **Donations** — One-time (Stripe + Swish) and recurring (Stripe)
- **Courses / LMS** — Modules, lessons, progress tracking, certificates
- **POS** — In-person sales via Stripe Terminal, Swish QR, cash, comps
- **Audit Trail** — Immutable log of all transactions across all channels
- **GDPR** — Data export, account deletion, consent management
- **Bilingual** — Swedish primary (/sv), English secondary (/en)

## Payment Gateways

| Gateway | Online | POS | Subscriptions |
|---------|--------|-----|---------------|
| Stripe  | ✅     | ✅ (Terminal) | ✅ |
| Swish   | ✅     | ✅ (QR)       | ❌ |
| Cash    | ❌     | ✅            | ❌ |

## Environment Variables

See `apps/web/.env.example` for all required variables.

## Deployment

Push to `main` triggers CI (lint + typecheck) and deploy (Docker build → Hetzner).

```bash
# Manual deploy
docker compose up -d
```

## License

Private — Yeshe Norbu / MindfulnessApps Sweden AB
