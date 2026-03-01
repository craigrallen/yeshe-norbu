// wp-redirects.ts — Full WordPress slug redirect map (201 slugs)
// Generated from docs/wp-page-audit.md
// Groups:
//   1. Direct page mappings
//   2. Event/course category pages
//   3. Removed/merged pages → closest equivalent
//   4. WP system/utility pages → /

export type Redirect = { destination: string; permanent: boolean };
export type RedirectMap = Record<string, Redirect>;

const P = true;  // permanent (301)
const T = false; // temporary (302)

// Existing routes that must NOT be redirected:
// /blog, /events, /calendar, /program, /shop, /kontakt, /om-oss,
// /bli-medlem, /bli-volontar, /nyhetsbrev, /donera, /stod-oss,
// /lokalhyra, /forsta-besoket, /besok-oss, /integritetspolicy,
// /logga-in, /registrera, /konto, /mitt-konto, /betala, /checkout

export const WP_REDIRECTS: RedirectMap = {
  // ─── Numbered/junk pages → home ─────────────────────────────────────────
  '/255452-2':         { destination: '/', permanent: P },
  '/255458-2':         { destination: '/', permanent: P },
  '/256292-2':         { destination: '/', permanent: P },
  '/256444-2':         { destination: '/', permanent: P },
  '/257082-2':         { destination: '/', permanent: P },
  '/258094-2':         { destination: '/', permanent: P },
  '/265462-2':         { destination: '/', permanent: P },

  // ─── About / Org ─────────────────────────────────────────────────────────
  '/about':                        { destination: '/om-oss', permanent: P },
  '/about-us':                     { destination: '/om-oss', permanent: P },
  '/about-us-2':                   { destination: '/om-oss', permanent: P },
  '/about/our-teachers':           { destination: '/om-oss#larare', permanent: P },
  '/centrets-larare':              { destination: '/om-oss#larare', permanent: P },
  '/our-people':                   { destination: '/om-oss#larare', permanent: P },
  '/our-resident-teacher':         { destination: '/om-oss#larare', permanent: P },
  '/teachers-mindfulness-and-compassion': { destination: '/om-oss#larare', permanent: P },
  '/larare-mindfulness-och-compassion':   { destination: '/om-oss#larare', permanent: P },
  '/teachers-yoga':                { destination: '/om-oss#larare', permanent: P },
  '/larare-yoga':                  { destination: '/om-oss#larare', permanent: P },
  '/non-profit':                   { destination: '/om-oss', permanent: P },
  '/organisation-details':         { destination: '/om-oss', permanent: P },
  '/foreningsinfo':                { destination: '/om-oss', permanent: P },
  '/association-bylaws':           { destination: '/om-oss', permanent: P },
  '/styrdokument':                 { destination: '/om-oss', permanent: P },
  '/governance-documents':         { destination: '/om-oss', permanent: P },
  '/how-to-support-the-centre':    { destination: '/stod-oss', permanent: P },

  // ─── Contact ─────────────────────────────────────────────────────────────
  '/contact':                      { destination: '/kontakt', permanent: P },
  '/contact-2':                    { destination: '/kontakt', permanent: P },
  '/contact-thank-you':            { destination: '/kontakt', permanent: P },
  '/kontakta-oss':                 { destination: '/kontakt', permanent: P },
  '/first-visit':                  { destination: '/forsta-besoket', permanent: P },
  '/forsta-besoket':               { destination: '/forsta-besoket', permanent: P },

  // ─── Membership ──────────────────────────────────────────────────────────
  '/become-a-member':              { destination: '/bli-medlem', permanent: P },
  '/bli-medlem':                   { destination: '/bli-medlem', permanent: P },
  '/ga-med':                       { destination: '/bli-medlem', permanent: P },
  '/join-us-2':                    { destination: '/bli-medlem', permanent: P },
  '/become-a-guardian':            { destination: '/bli-medlem', permanent: P },
  '/subscription':                 { destination: '/bli-medlem', permanent: P },

  // ─── Volunteer ───────────────────────────────────────────────────────────
  '/volunteer':                    { destination: '/bli-volontar', permanent: P },
  '/bli-volontar':                 { destination: '/bli-volontar', permanent: P },

  // ─── Donate ──────────────────────────────────────────────────────────────
  '/donate-2':                     { destination: '/donera', permanent: P },
  '/donationer':                   { destination: '/donera', permanent: P },
  '/buddhistisk-dana':             { destination: '/donera', permanent: P },

  // ─── Newsletter ──────────────────────────────────────────────────────────
  '/newsletter':                   { destination: '/nyhetsbrev', permanent: P },
  '/nyhetsbrev':                   { destination: '/nyhetsbrev', permanent: P },

  // ─── Venue hire ──────────────────────────────────────────────────────────
  '/venue-hire':                   { destination: '/lokalhyra', permanent: P },
  '/venue-hire-2':                 { destination: '/lokalhyra', permanent: P },
  '/room-booking':                 { destination: '/lokalhyra', permanent: P },

  // ─── Events & calendar ───────────────────────────────────────────────────
  '/event-directory':              { destination: '/events', permanent: P },
  '/the-events':                   { destination: '/events', permanent: P },
  '/calendar-2':                   { destination: '/calendar', permanent: P },
  '/calendar-old':                 { destination: '/calendar', permanent: P },
  '/test-calendar':                { destination: '/calendar', permanent: P },
  '/whats-on':                     { destination: '/events', permanent: P },
  '/whats-on-2':                   { destination: '/events', permanent: P },
  '/whats-on-today':               { destination: '/events', permanent: P },
  '/on-this-week':                 { destination: '/events', permanent: P },
  '/coming-soon':                  { destination: '/events', permanent: P },

  // ─── Program / courses overview ──────────────────────────────────────────
  '/program':                      { destination: '/program', permanent: P },
  '/course-list':                  { destination: '/program', permanent: P },
  '/course-registration':          { destination: '/program', permanent: P },
  '/what-we-offer':                { destination: '/program', permanent: P },
  '/mer':                          { destination: '/program', permanent: P },
  '/mer-fran-yeshenorbu':          { destination: '/program', permanent: P },
  '/more':                         { destination: '/program', permanent: P },
  '/intermediate-courses':         { destination: '/program', permanent: P },
  '/secular-courses-and-events':   { destination: '/program', permanent: P },

  // ─── Buddhism courses ────────────────────────────────────────────────────
  '/buddhism':                     { destination: '/program?category=buddhism', permanent: P },
  '/buddhism-2':                   { destination: '/program?category=buddhism', permanent: P },
  '/buddhism-courses':             { destination: '/program?category=buddhism', permanent: P },
  '/buddhism-kurser':              { destination: '/program?category=buddhism', permanent: P },
  '/buddhism-drop-in':             { destination: '/program?category=buddhism', permanent: P },
  '/buddhism-drop-in-2':          { destination: '/program?category=buddhism', permanent: P },
  '/buddhism-helgkurser':          { destination: '/program?category=buddhism', permanent: P },
  '/buddhism-helgkurser99':        { destination: '/program?category=buddhism', permanent: P },
  '/buddhism-i-ett-notskal':       { destination: '/program?category=buddhism', permanent: P },
  '/buddhism-in-a-nutshell':       { destination: '/program?category=buddhism', permanent: P },
  '/buddhism-retreat':             { destination: '/program?category=buddhism', permanent: P },
  '/buddhism-retreats':            { destination: '/program?category=buddhism', permanent: P },
  '/buddhism-weekend-courses':     { destination: '/program?category=buddhism', permanent: P },
  '/discovering-buddhism':         { destination: '/program?category=buddhism', permanent: P },
  '/lamrim-graduated-path-to-enlightenment':        { destination: '/program?category=buddhism', permanent: P },
  '/lamrim-graduated-path-to-enlightenment-course': { destination: '/program?category=buddhism', permanent: P },
  '/vajrayana-courses':            { destination: '/program?category=buddhism', permanent: P },
  '/weekend-teachings':            { destination: '/program?category=buddhism', permanent: P },
  '/public-talks':                 { destination: '/program?category=buddhism', permanent: P },
  '/train-your-mind':              { destination: '/program?category=buddhism', permanent: P },
  '/online-mind-training-centre':  { destination: '/program?category=buddhism', permanent: P },
  '/lama-chopa-text':              { destination: '/texter-och-boner', permanent: P },
  '/texter-och-boner':             { destination: '/texter-och-boner', permanent: P },
  '/texts-and-prayers':            { destination: '/texter-och-boner', permanent: P },
  '/foundations-of-selflessness':  { destination: '/program?category=buddhism', permanent: P },

  // ─── Mindfulness & Compassion ────────────────────────────────────────────
  '/mindfulness-and-compassion-2':        { destination: '/program?category=mindfulness', permanent: P },
  '/mindfulness-and-compassion-courses':  { destination: '/program?category=mindfulness', permanent: P },
  '/mindfulness-and-compassion-drop-in':  { destination: '/program?category=mindfulness', permanent: P },
  '/mindfulness-and-compassion-retreats': { destination: '/program?category=mindfulness', permanent: P },
  '/mindfulness-och-medkansla':           { destination: '/program?category=mindfulness', permanent: P },
  '/mindfulness-och-medkansla-drop-in':   { destination: '/program?category=mindfulness', permanent: P },
  '/mindfulness-och-medkansla-kurser':    { destination: '/program?category=mindfulness', permanent: P },
  '/mindfulness-och-medkansla-retreat':   { destination: '/program?category=mindfulness', permanent: P },
  '/mindfulness-real-world':              { destination: '/program?category=mindfulness', permanent: P },
  '/foundations-of-mindfulness':          { destination: '/program?category=mindfulness', permanent: P },
  '/foundations-of-mindfulness-old':      { destination: '/program?category=mindfulness', permanent: P },
  '/foundations-of-compassion':           { destination: '/program?category=mindfulness', permanent: P },
  '/cultivating-emotional-balance-course': { destination: '/program?category=mindfulness', permanent: P },
  '/msc-meditation-program':              { destination: '/program?category=mindfulness', permanent: P },
  '/introduction-to-buddhist-meditation': { destination: '/program?category=mindfulness', permanent: P },
  '/introduktion-till-buddhistisk-meditation': { destination: '/program?category=mindfulness', permanent: P },
  '/fom-course-material':                 { destination: '/program?category=mindfulness', permanent: P },
  '/see-learning':                        { destination: '/program?category=mindfulness', permanent: P },
  '/peace-of-mind':                       { destination: '/program?category=mindfulness', permanent: P },
  '/mental-gym-card-2':                   { destination: '/program?category=mindfulness', permanent: P },
  '/mental-gym-kort':                     { destination: '/program?category=mindfulness', permanent: P },

  // ─── Meditation drop-in ──────────────────────────────────────────────────
  '/meditation-2':                        { destination: '/program?category=meditation', permanent: P },
  '/drop-in-meditations':                 { destination: '/program?category=meditation', permanent: P },
  '/lunchtime-meditation-online':         { destination: '/program?category=meditation', permanent: P },
  '/how-to-meditate':                     { destination: '/program?category=meditation', permanent: P },

  // ─── Yoga ────────────────────────────────────────────────────────────────
  '/yoga-2':                       { destination: '/program?category=yoga', permanent: P },
  '/yoga-3':                       { destination: '/program?category=yoga', permanent: P },
  '/yoga-courses':                 { destination: '/program?category=yoga', permanent: P },
  '/yoga-kurser':                  { destination: '/program?category=yoga', permanent: P },
  '/yoga-drop-in':                 { destination: '/program?category=yoga', permanent: P },
  '/yoga-retreat':                 { destination: '/program?category=yoga', permanent: P },
  '/yoga-retreats':                { destination: '/program?category=yoga', permanent: P },
  '/iyengar-yoga':                 { destination: '/program?category=yoga', permanent: P },
  '/yin-yoga':                     { destination: '/program?category=yoga', permanent: P },

  // ─── Retreats ────────────────────────────────────────────────────────────
  '/retreats':                     { destination: '/program?category=retreat', permanent: P },
  '/retreats-2':                   { destination: '/program?category=retreat', permanent: P },

  // ─── Book circles ────────────────────────────────────────────────────────
  '/bokcirklar':                   { destination: '/program?category=bokcirkel', permanent: P },
  '/book-circle':                  { destination: '/program?category=bokcirkel', permanent: P },
  '/book-circles':                 { destination: '/program?category=bokcirkel', permanent: P },

  // ─── News / blog ─────────────────────────────────────────────────────────
  '/news':                         { destination: '/blog', permanent: P },
  '/news-2':                       { destination: '/blog', permanent: P },

  // ─── Shop / cafe ─────────────────────────────────────────────────────────
  '/butik':                        { destination: '/shop', permanent: P },
  '/shop':                         { destination: '/shop', permanent: P },
  '/cafe':                         { destination: '/besok-oss', permanent: P },
  '/cafe-2':                       { destination: '/besok-oss', permanent: P },
  '/library':                      { destination: '/besok-oss', permanent: P },
  '/videos':                       { destination: '/blog', permanent: P },

  // ─── Policy pages ────────────────────────────────────────────────────────
  '/data-protection-policy':       { destination: '/integritetspolicy', permanent: P },
  '/data-protection-policy-2':     { destination: '/integritetspolicy', permanent: P },
  '/grievance-procedure':          { destination: '/klagomalsprocedur', permanent: P },
  '/klagomalsprocedur':            { destination: '/klagomalsprocedur', permanent: P },
  '/missed-class-policy':          { destination: '/om-oss#policy', permanent: P },
  '/sales-policy':                 { destination: '/om-oss#policy', permanent: P },
  '/sales-policy1':                { destination: '/om-oss#policy', permanent: P },
  '/refund_returns':               { destination: '/om-oss#policy', permanent: P },
  '/lediga-jobb':                  { destination: '/om-oss', permanent: P },
  '/vacancies':                    { destination: '/om-oss', permanent: P },

  // ─── WP auth/account → new auth ──────────────────────────────────────────
  '/account':                      { destination: '/mitt-konto', permanent: P },
  '/my-account':                   { destination: '/mitt-konto', permanent: P },
  '/my-account-2':                 { destination: '/mitt-konto', permanent: P },
  '/mitt-konto-2':                 { destination: '/mitt-konto', permanent: P },
  '/member-profile-edit':          { destination: '/mitt-konto', permanent: P },
  '/edit':                         { destination: '/mitt-konto', permanent: P },
  '/log-in':                       { destination: '/logga-in', permanent: P },
  '/register':                     { destination: '/registrera', permanent: P },
  '/activate':                     { destination: '/registrera', permanent: P },
  '/dashboard':                    { destination: '/mitt-konto', permanent: P },
  '/clients':                      { destination: '/mitt-konto', permanent: P },
  '/non-profit-members-area':      { destination: '/mitt-konto', permanent: P },
  '/members':                      { destination: '/mitt-konto', permanent: P },
  '/groups':                       { destination: '/mitt-konto', permanent: P },

  // ─── WooCommerce pages → checkout ────────────────────────────────────────
  '/cart':                         { destination: '/betala', permanent: P },
  '/cart-2':                       { destination: '/betala', permanent: P },
  '/varukorg':                     { destination: '/betala', permanent: P },
  '/varukorg-2':                   { destination: '/betala', permanent: P },
  '/kassa':                        { destination: '/checkout', permanent: P },
  '/checkout-2':                   { destination: '/checkout', permanent: P },
  '/payment':                      { destination: '/checkout', permanent: P },
  '/purchase-confirmation':        { destination: '/checkout', permanent: P },
  '/purchase-history':             { destination: '/mitt-konto', permanent: P },
  '/order-received':               { destination: '/mitt-konto', permanent: P },
  '/transaction-failed':           { destination: '/checkout', permanent: P },
  '/thank-you':                    { destination: '/', permanent: P },
  '/checkin':                      { destination: '/', permanent: P },

  // ─── Misc WP pages / test pages → home ──────────────────────────────────
  '/home':                         { destination: '/', permanent: P },
  '/homenew':                      { destination: '/', permanent: P },
  '/new-home':                     { destination: '/', permanent: P },
  '/new-home-2-2':                 { destination: '/', permanent: P },
  '/new-menu':                     { destination: '/', permanent: P },
  '/newhem':                       { destination: '/', permanent: P },
  '/yeshenorbu':                   { destination: '/', permanent: P },
  '/yeshe-norbu-haller-oppet-covid-19-corona': { destination: '/', permanent: P },
  '/test':                         { destination: '/', permanent: P },
  '/test-page':                    { destination: '/', permanent: P },
  '/test-page-102':                { destination: '/', permanent: P },
  '/test-page-103-swedish':        { destination: '/', permanent: P },
  '/test-page-23':                 { destination: '/', permanent: P },
  '/test-page-3':                  { destination: '/', permanent: P },
  '/test-page-swedish':            { destination: '/', permanent: P },
  '/testing-page-for-yeshin':      { destination: '/', permanent: P },
  '/testningssida-for-yeshin':     { destination: '/', permanent: P },
  '/wpmltest':                     { destination: '/', permanent: P },
  '/wpmltestdivi':                 { destination: '/', permanent: P },

  // ─── Misc content pages ───────────────────────────────────────────────────
  '/all-about-karma-weekend-teachings-link-page': { destination: '/program?category=buddhism', permanent: P },
  '/link-presenting-the-path-module-3-discovering-buddhism': { destination: '/program?category=buddhism', permanent: P },
  '/therapist':                    { destination: '/program', permanent: P },
  '/lessons':                      { destination: '/program', permanent: P },
  '/buddhism-kurser':              { destination: '/program?category=buddhism', permanent: P },
};

/**
 * Look up a redirect for a given pathname (without locale prefix).
 * Returns destination + permanent flag, or null if no match.
 */
export function getWpRedirect(pathname: string): Redirect | null {
  return WP_REDIRECTS[pathname] ?? null;
}
