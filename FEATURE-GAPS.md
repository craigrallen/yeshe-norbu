# Feature Comparison: Old Site vs New Site

## Old Site Stack
- WordPress 6.8.1 + Divi theme
- WooCommerce 10.5.2
- WooCommerce Subscriptions
- Paid Memberships Pro (PMPro)
- The Events Calendar + Pro + FilterBar
- Event Tickets + Tickets Plus
- LearnDash LMS
- WPML + TranslatePress (bilingual)
- Stripe (live, with Apple Pay / Google Pay)
- Swish Ecommerce (Redlight, live)
- Mailchimp for WooCommerce
- Rank Math SEO
- BuddyPress (community)
- WooCommerce Name Your Price
- Cart Abandonment Recovery
- Discount Rules Pro
- iZettle (POS) integration
- GoURL (crypto payments - disabled)
- WPForms

---

## Feature Gap Matrix

| Feature | Old Site | New Site | Gap Level |
|---------|----------|----------|-----------|
| **Events listing** | ✅ Full TEC with filters | ✅ Basic grid | 🟡 Medium - no filters/search |
| **Event ticketing** | ✅ Tickets + Plus (Stripe/Swish) | ❌ Missing | 🔴 Critical |
| **Event registration** | ✅ Full checkout | ❌ Missing | 🔴 Critical |
| **Memberships (PMPro)** | ✅ 5 tiers, full lifecycle | 🟡 Schema only | 🔴 Critical |
| **Membership checkout** | ✅ Full payment flow | ❌ Missing | 🔴 Critical |
| **Subscriptions** | ✅ WC Subscriptions (222 active) | ❌ Missing | 🔴 Critical |
| **Stripe payments** | ✅ Live (card + Apple/Google Pay) | ❌ Keys set, no checkout | 🔴 Critical |
| **Swish payments** | ✅ Live (Swish Handel API) | ❌ Missing | 🔴 Critical |
| **User accounts** | ✅ Full WP user system | 🟡 Auth scaffold | 🟠 High |
| **User login/register** | ✅ Working | 🟡 Pages exist, no auth | 🟠 High |
| **Shop / Products** | ✅ WC shop | ❌ No product pages | 🟠 High |
| **Cart / Checkout** | ✅ Full WC checkout | ❌ Missing | 🔴 Critical |
| **Order history** | ✅ My Account | ❌ Missing | 🟠 High |
| **Donations** | ✅ Name Your Price | ❌ Missing | 🟠 High |
| **LearnDash courses** | ✅ Full LMS | ❌ Schema only | 🟠 High |
| **Course enrollment** | ✅ WC + LearnDash | ❌ Missing | 🟠 High |
| **Bilingual (SV/EN)** | ✅ WPML + TranslatePress | ✅ next-intl routing | ✅ Good |
| **Blog** | ✅ WP posts | ✅ 5 real posts + listing | ✅ Good |
| **Admin dashboard** | ✅ WP admin | ✅ Custom admin (basic) | 🟡 Medium |
| **Email notifications** | ✅ WP Mail SMTP (live) | ❌ Resend placeholder | 🟠 High |
| **SEO** | ✅ Rank Math | 🟡 Basic meta tags | 🟡 Medium |
| **Mailchimp sync** | ✅ WC Mailchimp | ❌ Missing | 🟡 Medium |
| **Cart abandonment** | ✅ WooCommerce plugin | ❌ Not needed MVP | 🟢 Low |
| **BuddyPress community** | ✅ Groups/profiles | ❌ Not planned | 🟢 Low |
| **iZettle POS** | ✅ Plugin active | ❌ Stripe Terminal planned | 🟡 Medium |
| **Discount codes** | ✅ WC Discount Rules Pro | ❌ Missing | 🟡 Medium |
| **Mobile navigation** | ✅ Divi responsive | ✅ Fixed hamburger menu | ✅ Good |
| **FPMT affiliation** | ✅ Footer | ✅ Footer | ✅ Good |

---

## Priority Order for Implementation

### 🔴 CRITICAL (site can't go live without these)
1. **Stripe checkout** - card payments for events, memberships, donations
2. **Swish checkout** - Swedish mobile payments (major payment method here)
3. **Event ticketing** - register + pay for events
4. **Membership checkout** - buy/renew memberships
5. **User auth** - register, login, account management

### 🟠 HIGH (implement before launch)
6. **Shop + Cart + Checkout flow**
7. **Donation page** (Name Your Price style)
8. **LearnDash courses** frontend
9. **Email notifications** (order confirmation, membership renewal)
10. **Order history** in user account

### 🟡 MEDIUM (post-launch)
11. **Event filters/search**
12. **Discount codes**
13. **SEO metadata per page/post**
14. **Stripe Terminal (POS)**
15. **Mailchimp sync**

---

## Stripe Config (from WP)
- **Live publishable key**: `pk_live_***REDACTED***`
- **Live secret key**: `sk_live_***REDACTED***`
- **Webhook secret**: `whsec_***REDACTED***`
- Statement descriptor: "Yeshe Norbu Mind Training"
- Features: Apple Pay ✅, Google Pay ✅, 3D Secure ✅, Saved cards ✅

## Swish Config (from WP)
- **Swish number**: `1233887346`
- **Cert file**: Saved to `migration/swish.pem`
- **License key**: `e9c6e70bb3456204335f7d3a86102eb8`
- **Provider**: Redlight Media Swish Handel
- **Mode**: Live (testmode: no)
- **Technical supplier**: Redlight (as_technical_supplier: yes)
