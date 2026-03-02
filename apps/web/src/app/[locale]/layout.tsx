import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { locales, type Locale } from '@/i18n';
import { MobileMenu } from '@/components/MobileMenu';
import { getSession } from '@/lib/auth';
import { createDb, userRoles } from '@yeshe/db';
import { eq } from 'drizzle-orm';
import '../globals.css';
import { OrganizationJsonLd } from '@/components/seo/JsonLd';
import { Pool } from 'pg';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CookieConsent } from '@/components/CookieConsent';
import { BackToTop } from '@/components/BackToTop';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  const siteName = 'Yeshin Norbu Meditationscenter';
  const tagline = sv ? 'Meditation, mindfulness & buddhistisk filosofi i Stockholm' : 'Meditation, mindfulness & Buddhist philosophy in Stockholm';
  const description = sv
    ? 'Yeshin Norbu erbjuder kurser i meditation, mindfulness, yoga och buddhistisk filosofi i hjärtat av Stockholm. Öppet för alla – nybörjare till avancerade.'
    : 'Yeshin Norbu offers courses in meditation, mindfulness, yoga and Buddhist philosophy in the heart of Stockholm. Open to all – beginners to advanced.';
  return {
    title: { default: `${siteName} — ${tagline}`, template: `%s | ${siteName}` },
    description,
    metadataBase: new URL('https://yeshinnorbu.se'),
    alternates: { canonical: `/${locale}`, languages: { sv: '/sv', en: '/en' } },
    openGraph: {
      siteName,
      locale: sv ? 'sv_SE' : 'en_GB',
      type: 'website',
      title: `${siteName} — ${tagline}`,
      description,
      images: [{ url: '/brand/church-01.jpg', width: 1200, height: 630, alt: siteName }],
    },
    twitter: { card: 'summary_large_image', title: `${siteName} — ${tagline}`, description, images: ['/brand/church-01.jpg'] },
    keywords: sv
      ? 'meditation stockholm, mindfulness, yoga, buddhism, meditationscenter, kurser meditation, retreat stockholm, FPMT'
      : 'meditation stockholm, mindfulness, yoga, buddhism, meditation center, meditation courses, retreat stockholm, FPMT',
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
    verification: {},
  };
}

export default async function LocaleLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  if (!locales.includes(locale as Locale)) notFound();
  const messages = await getMessages();
  const headersList = headers();
  const pathname = headersList.get('x-next-url') || headersList.get('x-invoke-path') || '';
  const isAdmin = pathname.includes('/admin');

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`min-h-screen font-sans antialiased ${isAdmin ? 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100' : 'bg-cream dark:bg-[#1A1A1A] text-charcoal dark:text-[#E8E4DE]'}`}>
        {!isAdmin && <OrganizationJsonLd />}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded focus:shadow-lg focus:text-sm focus:font-medium">
          Skip to content
        </a>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {!isAdmin && <AnnouncementBannerServer locale={locale as Locale} />}
            {!isAdmin && <Header locale={locale as Locale} />}
            <main id="main-content" className={isAdmin ? '' : 'pt-[72px] overflow-x-hidden'}>{children}</main>
            {!isAdmin && <Footer locale={locale as Locale} />}
            {!isAdmin && <CookieConsent />}
            {!isAdmin && <BackToTop />}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

async function AnnouncementBannerServer({ locale }: { locale: Locale }) {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const { rows } = await pool.query(`SELECT value FROM app_settings WHERE key = 'announcement' LIMIT 1`);
    if (!rows.length) return null;
    const data = rows[0].value;
    const obj = typeof data === 'string' ? JSON.parse(data) : data;
    if (!obj?.enabled || !obj?.text) return null;
    return <AnnouncementBanner text={obj.text} color={obj.color || '#E8B817'} />;
  } catch {
    return null;
  }
}

async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const sv = locale === 'sv';
  const session = await getSession();
  let isAdmin = false;
  if (session?.userId) {
    const db = createDb(process.env.DATABASE_URL!);
    const roles = await db.select().from(userRoles).where(eq(userRoles.userId, session.userId));
    isAdmin = roles.some((r) => r.role === 'admin');
  }

  const navItems = [
    { href: `/${locale}/program`, label: sv ? 'Program' : 'Programme' },
    { href: `/${locale}/events`, label: sv ? 'Evenemang' : 'Events' },
    { href: `/${locale}/om-oss`, label: sv ? 'Om oss' : 'About' },
    { href: `/${locale}/stod-oss`, label: sv ? 'Stöd oss' : 'Support' },
    { href: `/${locale}/besok-oss`, label: sv ? 'Besök oss' : 'Visit' },
    { href: `/${locale}/blog`, label: sv ? 'Blogg' : 'Blog' },
    { href: `/${locale}/kontakt`, label: sv ? 'Kontakt' : 'Contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1A1A1A] border-b border-[#E8E4DE] dark:border-[#3D3D3D] transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[72px]">
        <a href={`/${locale}`} className="flex items-center">
          <img src="/brand/logo-no-tag.png" alt="Yeshin Norbu" className="h-10 w-auto dark:brightness-[10]" />
        </a>
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-[14px] font-medium text-charcoal dark:text-[#E8E4DE] hover:text-brand-dark transition-colors tracking-wide">
              {item.label}
            </a>
          ))}
          <ThemeToggle />
          <a href={locale === 'sv' ? '/en' : '/sv'} className="text-xs text-charcoal-light dark:text-[#A0A0A0] hover:text-charcoal dark:hover:text-[#E8E4DE] border border-[#E8E4DE] dark:border-[#3D3D3D] rounded px-2.5 py-1 tracking-wide">
            {locale === 'sv' ? 'EN' : 'SV'}
          </a>
          {session ? (
            <a href={`/api/auth/logout?next=/${locale}`} className="text-[13px] font-medium text-charcoal-light hover:text-charcoal">{sv ? 'Logga ut' : 'Logout'}</a>
          ) : (
            <a href={`/${locale}/logga-in`} className="text-[13px] font-medium text-charcoal-light hover:text-charcoal">{tc('login')}</a>
          )}
          <a href={`/${locale}/bli-medlem`} className="btn-charcoal !py-2.5 !px-6 !text-[13px] !rounded-lg">
            {sv ? 'Bli medlem' : 'Join'}
          </a>
          {isAdmin && (
            <a href={`/${locale}/admin`} className="text-[11px] text-charcoal-light hover:text-charcoal border border-[#E8E4DE] px-2 py-1 rounded">Admin</a>
          )}
        </nav>
        <MobileMenu
          items={navItems}
          locale={locale}
          loginLabel={tc('login')}
          logoutLabel={sv ? 'Logga ut' : 'Logout'}
          isLoggedIn={Boolean(session)}
          showAdmin={isAdmin}
          langLabel={locale === 'sv' ? 'English' : 'Svenska'}
          langHref={locale === 'sv' ? '/en' : '/sv'}
        />
      </div>
    </header>
  );
}

async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const sv = locale === 'sv';
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-white/70 mt-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <img src="/brand/logo-no-tag.png" alt="Yeshin Norbu" className="h-9 brightness-[10] mb-4" />
            <p className="text-sm leading-relaxed">
              Yeshin Norbu Meditationscenter<br/>
              Roslagsgatan 62, Stockholm<br/>
              +46 (0)8 55 008 575<br/>
              info@yeshinnorbu.se
            </p>
          </div>
          <div>
            <h4 className="text-brand-light font-sans text-xs font-bold tracking-widest uppercase mb-4">Program</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href={`/${locale}/program`} className="hover:text-brand transition-colors">Buddhism</a>
              <a href={`/${locale}/program`} className="hover:text-brand transition-colors">Mindfulness</a>
              <a href={`/${locale}/program`} className="hover:text-brand transition-colors">Yoga & Qigong</a>
              <a href={`/${locale}/events`} className="hover:text-brand transition-colors">{sv ? 'Kalender' : 'Calendar'}</a>
            </div>
          </div>
          <div>
            <h4 className="text-brand-light font-sans text-xs font-bold tracking-widest uppercase mb-4">{sv ? 'Stöd oss' : 'Support'}</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href={`/${locale}/bli-medlem`} className="hover:text-brand transition-colors">{sv ? 'Bli medlem' : 'Membership'}</a>
              <a href={`/${locale}/donera`} className="hover:text-brand transition-colors">{sv ? 'Donera' : 'Donate'}</a>
              <a href={`/${locale}/bli-volontar`} className="hover:text-brand transition-colors">{sv ? 'Volontär' : 'Volunteer'}</a>
              <a href={`/${locale}/lokalhyra`} className="hover:text-brand transition-colors">{sv ? 'Lokalhyra' : 'Venue hire'}</a>
            </div>
          </div>
          <div>
            <h4 className="text-brand-light font-sans text-xs font-bold tracking-widest uppercase mb-4">Info</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href={`/${locale}/om-oss`} className="hover:text-brand transition-colors">{sv ? 'Om oss' : 'About'}</a>
              <a href={`/${locale}/kontakt`} className="hover:text-brand transition-colors">{sv ? 'Kontakt' : 'Contact'}</a>
              <a href={`/${locale}/integritetspolicy`} className="hover:text-brand transition-colors">{sv ? 'Integritetspolicy' : 'Privacy'}</a>
              <a href={`/${locale}/nyhetsbrev`} className="hover:text-brand transition-colors">{sv ? 'Nyhetsbrev' : 'Newsletter'}</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <span>© {year} Yeshin Norbu Meditationscenter. {sv ? 'Ideell förening.' : 'Non-profit association.'}</span>
          <img src="/brand/fpmt-logo.png" alt="FPMT" className="h-7 opacity-60" />
        </div>
      </div>
    </footer>
  );
}
