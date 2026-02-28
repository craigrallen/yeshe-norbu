# Yeshe Norbu Migration Status

## Data Extraction Complete ✅

Successfully extracted from yeshinnorbu.se WordPress:

| Data Type | Records | Size | Status |
|-----------|---------|------|--------|
| **WooCommerce Orders** | 6,163 | 42 MB | ✅ Complete |
| **Products** | 1,251 | 9.9 MB | ✅ Complete |
| **Customers** | 1,068 | 2.6 MB | ✅ Complete (includes user data) |
| **Subscriptions** | 222 | 1.2 MB | ✅ Complete |
| **Events** | 72 | 992 KB | ✅ Complete (with nested venues) |
| **Event Categories** | 5 | 8 KB | ✅ Complete |
| **Membership Levels** | 5 | - | ✅ Identified |

### Extracted Data Location
`/Users/craig/Projects/yeshe-norbu/migration/extracted/*.json`

### WooCommerce API Keys (Read-only)
- **Consumer Key**: `ck_8aa870d7a852db83be15404683b72240511b90d5`
- **Consumer Secret**: `cs_e383b598b663fba36fd6bca20abee3b87ef9a24d`

## Data Not Extracted

- **LearnDash Courses**: Not exposed via REST API (requires WP-CLI or manual export)
- **WP Users (detailed)**: Blocked by Wordfence (but covered by WC customers data)
- **Pages/Posts**: REST API returned 400 errors
- **Attendees/Venues/Organizers**: Empty (data is nested in events JSON)

## Railway Deployment

### Current Status
- **Project**: `yeshe-norbu` (`b96d406b-969c-437f-9a80-1feeec01f5f9`)
- **Service**: `yeshe-norbu` (`feb67e16-fc87-4558-a769-e90020c393ab`)
- **Region**: europe-west4 (Amsterdam)
- **URL**: https://yeshe-norbu-production.up.railway.app
- **Latest Build**: `7aedabf8-5cb3-45eb-b14b-908e169212c2` (in progress)

### Recent Fixes Applied
- ✅ Added `favicon.ico` to fix runtime error
- ✅ Updated `i18n.ts` to use `requestLocale` (next-intl 3.22+ compatibility)
- ✅ Connected Railway Postgres `DATABASE_URL` to web service
- ✅ Rebuilt native modules (`argon2`) for Alpine Linux in Docker

## Data Import Script

### Location
`/Users/craig/Projects/yeshe-norbu/migration/import-data.ts`

### What It Does
1. **Users**: Imports from WC customers → `users` table
2. **Products**: Maps WC products → `products` table (with type detection)
3. **Events**: Imports Tribe events with nested venues → `events` table
4. **Memberships**: Maps WC subscriptions → `memberships` table (Friend/Supporter/Benefactor tiers)
5. **Orders**: Full order history → `orders` + `salesAuditLog` tables
6. **Audit Trail**: Creates audit log entries for all orders (GDPR compliance)

### Membership Tier Mapping
- **Friend Annual** (WP) → `friend` tier
- **Non-Profit Yearly** (WP) → `supporter` tier
- **Mental Gym Card Monthly** (WP) → `supporter` tier

## Next Steps

### 1. Verify Railway Deployment
```bash
cd /Users/craig/Projects/yeshe-norbu
railway logs --tail 50
```

Check that the site loads at: https://yeshe-norbu-production.up.railway.app

### 2. Run Database Migration
```bash
# Get Railway Postgres URL
railway variables --service postgres

# Run migration against Railway DB
railway run pnpm --filter @yeshe/db db:migrate
```

### 3. Import Data
```bash
# Run import script against Railway DB
railway run tsx migration/import-data.ts
```

### 4. Verify Imported Data
- Log into Railway Postgres and check table counts:
  ```sql
  SELECT COUNT(*) FROM users;
  SELECT COUNT(*) FROM products;
  SELECT COUNT(*) FROM orders;
  SELECT COUNT(*) FROM events;
  SELECT COUNT(*) FROM memberships;
  ```

### 5. Test the Site
- Browse to https://yeshe-norbu-production.up.railway.app
- Check that events, products, and user data are visible
- Test registration/login flows
- Verify Stripe test mode integration

## Missing / TODO

### Data Gaps
- [ ] LearnDash courses (need WP-CLI or manual export)
- [ ] Full user profiles (2FA settings, roles, etc.)
- [ ] WP pages/posts (marketing content)
- [ ] Media library (images hosted on WP site)

### Configuration Needed
- [ ] Stripe live keys (currently test mode only)
- [ ] Swish Merchant credentials
- [ ] Stripe Terminal location ID for Sweden
- [ ] Email templates (currently placeholder text)
- [ ] SMTP credentials for Resend

### Production Deployment
- [ ] Move to Hetzner Cloud (Frankfurt/Helsinki)
- [ ] Set up Cloudflare R2 for media storage
- [ ] Configure domain (yeshinnorbu.se)
- [ ] SSL certificate
- [ ] Production environment variables

## GitHub Security Alerts

14 vulnerabilities detected (7 high, 7 moderate):
https://github.com/craigrallen/yeshe-norbu/security/dependabot

**Action required**: Review and fix before production deployment.

## Contact

- **WordPress Site**: https://yeshinnorbu.se
- **WP Admin**: https://yeshinnorbu.se/wp-admin/
- **GitHub Repo**: https://github.com/craigrallen/yeshe-norbu
- **Railway Project**: https://railway.com/project/b96d406b-969c-437f-9a80-1feeec01f5f9
