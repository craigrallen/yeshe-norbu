import { getTranslations } from 'next-intl/server';

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
          {t('heroTitle')}
        </h1>
        <p className="text-xl md:text-2xl text-muted mb-6">
          {t('heroSubtitle')}
        </p>
        <p className="max-w-2xl mx-auto text-base text-muted leading-relaxed">
          {t('heroDescription')}
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <a
            href={`/${locale}/program`}
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark transition-colors"
          >
            {t('upcomingEvents')}
          </a>
          <a
            href={`/${locale}/donera`}
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg border border-border text-primary font-medium hover:bg-gray-50 transition-colors"
          >
            {t('supportUs')}
          </a>
        </div>
      </section>

      {/* Upcoming Events placeholder */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-primary">{t('upcomingEvents')}</h2>
          <a href={`/${locale}/program`} className="text-sm text-brand hover:text-brand-dark font-medium">
            {t('viewAll')} →
          </a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Events will be loaded from DB */}
          <div className="rounded-lg border border-border p-8 text-center text-muted">
            <p>{locale === 'sv' ? 'Evenemang laddas snart...' : 'Events loading soon...'}</p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-primary mb-4">{t('ourMission')}</h2>
        <p className="text-base text-muted leading-relaxed">
          {t('missionText')}
        </p>
      </section>
    </div>
  );
}
