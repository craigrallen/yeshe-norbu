import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import { MobileMenu } from '@/components/MobileMenu';
import '../globals.css';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' });
  return {
    title: {
      default: `${t('siteName')} — ${t('tagline')}`,
      template: `%s | ${t('siteName')}`,
    },
    description: t('tagline'),
    metadataBase: new URL('https://yeshinnorbu.se'),
    alternates: { canonical: '/', languages: { sv: '/sv', en: '/en' } },
    openGraph: { siteName: t('siteName'), locale: locale === 'sv' ? 'sv_SE' : 'en_GB' },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale as Locale} />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer locale={locale as Locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  const navItems = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/program`, label: t('program') },
    { href: `/${locale}/events`, label: locale === 'sv' ? 'Evenemang' : 'Events' },
    { href: `/${locale}/blog`, label: 'Blogg' },
    { href: `/${locale}/donera`, label: t('donate') },
    { href: `/${locale}/bli-medlem`, label: t('membership') },
  ];

  return (
    <header className="border-b border-border bg-surface sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href={`/${locale}`} className="flex items-center">
          <img src="/logo.png" alt="Yeshin Norbu" className="h-10 w-auto" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-primary hover:text-brand transition-colors">
              {item.label}
            </a>
          ))}
          <a
            href={locale === 'sv' ? '/en' : '/sv'}
            className="text-sm text-muted hover:text-primary border border-border rounded px-2 py-1"
          >
            {locale === 'sv' ? 'EN' : 'SV'}
          </a>
          <a
            href={`/${locale}/logga-in`}
            className="text-sm font-medium px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
          >
            {tc('login')}
          </a>
          <a href={`/${locale}/admin`} className="hidden md:inline-block text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-2 py-1 rounded ml-2">
            Admin
          </a>
        </nav>

        {/* Mobile hamburger */}
        <MobileMenu
          items={navItems}
          locale={locale}
          loginLabel={tc('login')}
          langLabel={locale === 'sv' ? 'English' : 'Svenska'}
          langHref={locale === 'sv' ? '/en' : '/sv'}
        />
      </div>
    </header>
  );
}

async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-16 py-12 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-primary mb-3">Yeshin Norbu</h3>
            <p className="text-sm text-muted leading-relaxed">
              {locale === 'sv' ? 'Buddhistiskt center i Stockholm, affilierat med FPMT.' : 'Buddhist centre in Stockholm, affiliated with FPMT.'}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-3">{locale === 'sv' ? 'Snabblänkar' : 'Quick Links'}</h3>
            <div className="flex flex-col gap-2 text-sm text-muted">
              <a href={`/${locale}/events`} className="hover:text-primary">{locale === 'sv' ? 'Evenemang' : 'Events'}</a>
              <a href={`/${locale}/blog`} className="hover:text-primary">Blogg</a>
              <a href={`/${locale}/bli-medlem`} className="hover:text-primary">{locale === 'sv' ? 'Bli medlem' : 'Membership'}</a>
              <a href={`/${locale}/donera`} className="hover:text-primary">{locale === 'sv' ? 'Donera' : 'Donate'}</a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-3">{locale === 'sv' ? 'Kontakt' : 'Contact'}</h3>
            <p className="text-sm text-muted">{t('address')}</p>
            <p className="text-sm text-muted mt-2">
              <a href="https://fpmt.org" className="hover:text-primary">Affilierat med FPMT →</a>
            </p>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted">
          <p>{t('copyright', { year: String(year) })}</p>
          <div className="flex gap-4">
            <a href={`/${locale}/integritetspolicy`} className="hover:text-primary">{t('privacy')}</a>
            <a href={`/${locale}/cookies`} className="hover:text-primary">{t('cookies')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
