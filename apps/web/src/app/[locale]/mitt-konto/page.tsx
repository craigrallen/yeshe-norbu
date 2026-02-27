import { getTranslations } from 'next-intl/server';

export default async function AccountPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'account' });

  // TODO: Get user from session
  const sections = [
    { label: t('orders'), href: `/${locale}/mitt-konto/bestallningar`, icon: '📦' },
    { label: t('membership'), href: `/${locale}/mitt-konto/medlemskap`, icon: '🎫' },
    { label: t('courses'), href: `/${locale}/mitt-konto/kurser`, icon: '📚' },
    { label: t('settings'), href: `/${locale}/mitt-konto/installningar`, icon: '⚙️' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-8">{t('title')}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">{s.icon}</span>
            <span className="text-sm font-medium text-primary">{s.label}</span>
          </a>
        ))}
      </div>

      <div className="mt-12 space-y-3">
        <a
          href="/api/gdpr/export"
          className="block text-sm text-muted hover:text-primary"
        >
          {t('exportData')} →
        </a>
        <button className="text-sm text-error hover:underline">
          {t('deleteAccount')}
        </button>
      </div>
    </div>
  );
}
