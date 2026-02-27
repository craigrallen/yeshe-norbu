import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
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
    alternates: {
      canonical: '/',
      languages: {
        sv: '/sv',
        en: '/en',
      },
    },
    openGraph: {
      siteName: t('siteName'),
      locale: locale === 'sv' ? 'sv_SE' : 'en_GB',
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

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
    { href: `/${locale}/donera`, label: t('donate') },
    { href: `/${locale}/bli-medlem`, label: t('membership') },
  ];

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href={`/${locale}`} className="text-xl font-bold text-primary">
          {tc('siteName')}
        </a>
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
          <a href={`/${locale}/logga-in`} className="text-sm font-medium text-brand hover:text-brand-dark">
            {tc('login')}
          </a>
        </nav>
      </div>
    </header>
  );
}

async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-16 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
          <p>{t('address')}</p>
          <div className="flex gap-4">
            <a href={`/${locale}/integritetspolicy`} className="hover:text-primary">{t('privacy')}</a>
            <a href={`/${locale}/cookies`} className="hover:text-primary">{t('cookies')}</a>
          </div>
          <p>{t('copyright', { year: String(year) })}</p>
        </div>
      </div>
    </footer>
  );
}
