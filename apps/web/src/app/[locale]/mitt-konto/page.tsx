import { getTranslations } from 'next-intl/server';
import { SiteIcon } from '@/components/site-icon';

export default async function AccountPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'account' });

  const sections = [
    { label: t('orders'), href: `/${locale}/mitt-konto/bestallningar`, icon: 'box' as const },
    { label: t('membership'), href: `/${locale}/mitt-konto/medlemskap`, icon: 'ticket' as const },
    { label: t('courses'), href: `/${locale}/mitt-konto/kurser`, icon: 'book' as const },
    { label: t('settings'), href: `/${locale}/mitt-konto/installningar`, icon: 'settings' as const },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-8">{t('title')}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <a key={s.href} href={s.href} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 hover:shadow-md transition-shadow">
            <SiteIcon name={s.icon} className="w-6 h-6 text-[#58595b]" />
            <span className="text-sm font-medium text-primary">{s.label}</span>
          </a>
        ))}
      </div>

      <div className="mt-12 space-y-3">
        <a href="/api/gdpr/export" className="block text-sm text-muted hover:text-primary">{t('exportData')} →</a>
        <button className="text-sm text-error hover:underline">{t('deleteAccount')}</button>
      </div>
    </div>
  );
}
