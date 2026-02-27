import { getTranslations } from 'next-intl/server';

export default async function RegisterPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <div className="max-w-sm mx-auto py-12">
      <h1 className="text-2xl font-bold text-primary mb-6 text-center">{t('registerTitle')}</h1>
      <form action="/api/auth/register" method="POST" className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-sm font-medium text-primary">{t('firstName')}</label>
            <input id="firstName" name="firstName" type="text" required className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-sm font-medium text-primary">{t('lastName')}</label>
            <input id="lastName" name="lastName" type="text" required className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-primary">{t('email')}</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-primary">{t('password')}</label>
          <input id="password" name="password" type="password" required autoComplete="new-password" minLength={8} className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-primary">{t('confirmPassword')}</label>
          <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="w-full h-10 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark transition-colors">
          {t('registerButton')}
        </button>
        <div className="text-center text-sm text-muted">
          <a href={`/${locale}/logga-in`} className="text-brand hover:text-brand-dark">{t('hasAccount')}</a>
        </div>
      </form>
    </div>
  );
}
