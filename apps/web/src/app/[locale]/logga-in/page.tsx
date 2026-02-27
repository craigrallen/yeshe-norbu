import { getTranslations } from 'next-intl/server';

export default async function LoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <div className="max-w-sm mx-auto py-12">
      <h1 className="text-2xl font-bold text-primary mb-6 text-center">{t('loginTitle')}</h1>
      <form action="/api/auth/login" method="POST" className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-primary">{t('email')}</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-primary">{t('password')}</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <button
          type="submit"
          className="w-full h-10 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark transition-colors"
        >
          {t('loginButton')}
        </button>
        <div className="text-center text-sm text-muted">
          <a href={`/${locale}/registrera`} className="text-brand hover:text-brand-dark">
            {t('noAccount')}
          </a>
        </div>
      </form>
    </div>
  );
}
