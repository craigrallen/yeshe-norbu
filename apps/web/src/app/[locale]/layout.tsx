import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import { MobileMenu } from '@/components/MobileMenu';
import { getSession } from '@/lib/auth';
import { createDb, userRoles } from '@yeshe/db';
import { eq } from 'drizzle-orm';
import '../globals.css';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' });
  return {
    title: { default: `${t('siteName')} — ${t('tagline')}`, template: `%s | ${t('siteName')}` },
    description: t('tagline'),
    metadataBase: new URL('https://yeshinnorbu.se'),
    alternates: { canonical: '/', languages: { sv: '/sv', en: '/en' } },
    openGraph: { siteName: t('siteName'), locale: locale === 'sv' ? 'sv_SE' : 'en_GB' },
  };
}

export default async function LocaleLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  if (!locales.includes(locale as Locale)) notFound();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body className="min-h-screen bg-cream font-sans antialiased text-charcoal">
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale as Locale} />
          <main>{children}</main>
          <Footer locale={locale as Locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E4DE] transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[72px]">
        <a href={`/${locale}`} className="flex items-center">
          <img src="/brand/logo-no-tag.png" alt="Yeshin Norbu" className="h-10 w-auto" />
        </a>
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-[14px] font-medium text-charcoal hover:text-brand-dark transition-colors tracking-wide">
              {item.label}
            </a>
          ))}
          <a href={locale === 'sv' ? '/en' : '/sv'} className="text-xs text-charcoal-light hover:text-charcoal border border-[#E8E4DE] rounded px-2.5 py-1 tracking-wide">
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
