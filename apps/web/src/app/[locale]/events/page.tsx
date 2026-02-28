import { createDb, events, eventCategories } from '@yeshe/db';
import { eq, asc, desc } from 'drizzle-orm';

async function loadEvents() {
  const db = createDb(process.env.DATABASE_URL!);

  const published = await db
    .select({
      id: events.id,
      slug: events.slug,
      titleSv: events.titleSv,
      titleEn: events.titleEn,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      venue: events.venue,
      featuredImageUrl: events.featuredImageUrl,
      categoryNameSv: eventCategories.nameSv,
      categoryNameEn: eventCategories.nameEn,
    })
    .from(events)
    .leftJoin(eventCategories, eq(events.categoryId, eventCategories.id))
    .where(eq(events.published, true))
    .orderBy(asc(events.startsAt))
    .limit(200);

  if (published.length > 0) return published;

  return db
    .select({
      id: events.id,
      slug: events.slug,
      titleSv: events.titleSv,
      titleEn: events.titleEn,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      venue: events.venue,
      featuredImageUrl: events.featuredImageUrl,
      categoryNameSv: eventCategories.nameSv,
      categoryNameEn: eventCategories.nameEn,
    })
    .from(events)
    .leftJoin(eventCategories, eq(events.categoryId, eventCategories.id))
    .orderBy(desc(events.startsAt))
    .limit(200);
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function fallbackImage(i: number) {
  return i % 2 === 0 ? '/events/wisdom-retreat.jpg' : '/events/geshe-sherab.jpg';
}

export default async function EventsPage({ params: { locale } }: { params: { locale: string } }) {
  const isSv = locale === 'sv';
  const eventRows = await loadEvents();

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <div className="bg-[#58595b] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{isSv ? 'Evenemang & Retreatter' : 'Events & Retreats'}</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {isSv ? 'Välkommen till våra meditationskvällar, studiedagar och retreatter i Stockholm.' : 'Join us for meditation evenings, study days and retreats in Stockholm.'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventRows.map((event, i) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="h-1.5 bg-[#f5ca00]" />
              <img src={event.featuredImageUrl || fallbackImage(i)} alt={isSv ? event.titleSv : event.titleEn || event.titleSv} className="w-full h-44 object-cover" loading="lazy" />

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#f5ca00] bg-[#FFF9EE] px-2 py-1 rounded-full">{isSv ? event.categoryNameSv || 'Evenemang' : event.categoryNameEn || 'Event'}</span>
                  <span className="text-xs text-gray-400">{formatDate(event.startsAt)}</span>
                </div>

                <h2 className="font-bold text-[#58595b] text-lg mb-2 leading-snug">{isSv ? event.titleSv : event.titleEn || event.titleSv}</h2>

                <div className="text-sm text-gray-500 space-y-1 mb-4">
                  <p>{event.venue || 'Yeshin Norbu, Stockholm'}</p>
                </div>

                <div className="mt-auto">
                  <a href={`/${locale}/events/${event.slug}`} className="px-4 py-2 rounded-xl font-semibold text-sm transition-colors bg-[#f5ca00] text-white hover:bg-[#d4af00] inline-block">{isSv ? 'Läs mer' : 'Read more'}</a>
                </div>
              </div>
            </div>
          ))}
          {eventRows.length === 0 && (
            <p className="col-span-3 text-center text-gray-400 py-12">{isSv ? 'Inga evenemang just nu' : 'No events right now'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
