import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Program' : 'Programme',
    description: sv ? 'Utforska Yeshin Norbus program — kurser, retreats och drop-in i meditation, mindfulness, yoga och buddhism.' : 'Explore Yeshin Norbu programme — courses, retreats and drop-in in meditation, mindfulness, yoga and Buddhism.',
  };
}

import { getTranslations } from 'next-intl/server';

export default async function ProgramPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'events' });

  // TODO: Fetch events from database
  const events: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    category: string;
    venue: string;
    slug: string;
    priceSek: string;
  }> = [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">{t('title')}</h1>

      {/* Category filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button className="px-4 py-2 rounded-full bg-brand text-white text-sm font-medium">
          {t('allCategories')}
        </button>
        {/* Category buttons populated from DB */}
      </div>

      {events.length === 0 ? (
        <p className="text-muted py-12 text-center">{t('noEvents')}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <a
              key={event.id}
              href={`/${locale}/program/${event.slug}`}
              className="block rounded-lg border border-border bg-surface p-5 hover:shadow-md transition-shadow"
            >
              <p className="text-xs text-brand font-medium mb-1">{event.category}</p>
              <h3 className="text-base font-semibold text-primary mb-2">{event.title}</h3>
              <p className="text-sm text-muted">{event.date} · {event.time}</p>
              <p className="text-sm text-muted">{event.venue}</p>
              <p className="text-sm font-medium text-primary mt-2">{event.priceSek} kr</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
