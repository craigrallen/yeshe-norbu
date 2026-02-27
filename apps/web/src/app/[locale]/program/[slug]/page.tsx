import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default async function EventPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const t = await getTranslations({ locale, namespace: 'events' });

  // TODO: Fetch event by slug from database
  // const event = await getEventBySlug(slug, locale);
  // if (!event) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <a href={`/${locale}/program`} className="text-sm text-brand hover:text-brand-dark mb-4 inline-block">
        ← {t('title')}
      </a>

      <article className="space-y-8">
        {/* Event header */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {/* {event.title} */}
            {locale === 'sv' ? 'Evenemang laddas...' : 'Event loading...'}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <span><strong>{t('when')}:</strong> —</span>
            <span><strong>{t('where')}:</strong> —</span>
            <span><strong>{t('teacher')}:</strong> —</span>
          </div>
        </div>

        {/* Description */}
        <div className="prose max-w-none text-primary">
          <p className="text-muted">
            {locale === 'sv' ? 'Beskrivning laddas från databasen...' : 'Description loads from database...'}
          </p>
        </div>

        {/* Ticket widget */}
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">{t('tickets')}</h2>
          <p className="text-sm text-muted">
            {locale === 'sv' ? 'Biljettsystemet kopplas till databasen.' : 'Ticket system will connect to database.'}
          </p>
        </div>
      </article>
    </div>
  );
}
