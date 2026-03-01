import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Evenemang & Kurser' : 'Events & Courses',
    description: sv
      ? 'Se hela programmet med kurser, retreats och drop-in i meditation, mindfulness, yoga och buddhism på Yeshin Norbu.'
      : 'Browse all courses, retreats and drop-in sessions in meditation, mindfulness, yoga and Buddhism at Yeshin Norbu.',
  };
}

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function EventsPage({ params: { locale }, searchParams }: { params: { locale: string }; searchParams: { cat?: string; past?: string } }) {
  const sv = locale === 'sv';
  const catFilter = searchParams.cat || '';
  const showPast = searchParams.past === '1';

  // Categories
  const { rows: categories } = await pool.query('SELECT id, slug, name_sv, name_en FROM event_categories ORDER BY name_sv');
  const { rows: featuredRows } = await pool.query("SELECT value FROM app_settings WHERE key='events.featured_ids' LIMIT 1");
  const featuredIds: string[] = featuredRows?.[0]?.value || [];

  // Events
  let query = `
    SELECT e.id, e.slug, e.title_sv, e.title_en, e.starts_at, e.ends_at, e.venue, e.featured_image_url, e.is_online,
           ec.name_sv as cat_sv, ec.name_en as cat_en, ec.slug as cat_slug,
           COALESCE(
             (SELECT json_agg(json_build_object('slug', ac.slug, 'name_sv', ac.name_sv, 'name_en', ac.name_en))
              FROM event_category_assignments eca
              JOIN event_categories ac ON eca.category_id = ac.id
              WHERE eca.event_id = e.id),
             '[]'::json
           ) as extra_cats
    FROM events e
    LEFT JOIN event_categories ec ON e.category_id = ec.id
    WHERE e.published = true
  `;
  const params: any[] = [];

  if (!showPast) {
    params.push(new Date().toISOString());
    query += ` AND e.starts_at >= $${params.length}`;
  }

  if (catFilter) {
    params.push(catFilter);
    query += ` AND ec.slug = $${params.length}`;
  }

  query += ' ORDER BY e.starts_at ' + (showPast ? 'DESC' : 'ASC') + ' LIMIT 200';

  const { rows: events } = await pool.query(query, params);

  const featuredEvents = events.filter((e: any) => featuredIds.includes(e.id)).slice(0, 3);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  function fallbackImage(i: number) {
    return i % 2 === 0 ? '/events/wisdom-retreat.jpg' : '/events/geshe-sherab.jpg';
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <div className="bg-[#58595b] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{sv ? 'Evenemang & Retreatter' : 'Events & Retreats'}</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {sv ? 'Välkommen till våra meditationskvällar, studiedagar och retreatter i Stockholm.' : 'Join us for meditation evenings, study days and retreats in Stockholm.'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <span className="text-sm text-gray-500">{sv ? 'Filter:' : 'Filter:'}</span>
          <a href={`/${locale}/events`} className={"px-3 py-1.5 rounded-full text-sm font-medium border " + (!catFilter && !showPast ? 'bg-[#58595b] text-white border-[#58595b]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')}>
            {sv ? 'Kommande' : 'Upcoming'}
          </a>
          {categories.map((c: any) => (
            <a key={c.slug} href={`/${locale}/events?cat=${c.slug}`} className={"px-3 py-1.5 rounded-full text-sm font-medium border " + (catFilter === c.slug ? 'bg-[#58595b] text-white border-[#58595b]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')}>
              {sv ? c.name_sv : c.name_en}
            </a>
          ))}
          <a href={`/${locale}/events?past=1`} className={"px-3 py-1.5 rounded-full text-sm font-medium border " + (showPast ? 'bg-[#58595b] text-white border-[#58595b]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')}>
            {sv ? 'Tidigare' : 'Past'}
          </a>
          <span className="flex-1" />
          <a href={`/${locale}/calendar`} className="text-sm text-blue-600 hover:underline">{sv ? 'Kalendervy' : 'Calendar view'} &rarr;</a>
          <a href="/api/events/ical" className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5">
            {sv ? 'Exportera iCal' : 'Export iCal'}
          </a>
        </div>

        {featuredEvents.length > 0 && !showPast && !catFilter && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-[#58595b]">{sv ? 'Utvalda evenemang' : 'Featured events'}</h2>
              <a href={`/${locale}/events`} className="text-sm text-blue-600 hover:underline">{sv ? 'Visa alla' : 'Show all'} →</a>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {featuredEvents.map((event: any, i: number) => (
                <a key={event.id} href={`/${locale}/events/${event.slug}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <img src={event.featured_image_url || fallbackImage(i)} alt={sv ? event.title_sv : event.title_en} className="w-full h-36 object-cover" loading="lazy" />
                  <div className="p-4">
                    <h3 className="font-semibold text-[#58595b]">{sv ? event.title_sv : event.title_en}</h3>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(event.starts_at)}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="text-sm text-gray-400 mb-4">{events.length} {sv ? 'evenemang' : 'events'}</div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any, i: number) => (
            <a key={event.id} href={`/${locale}/events/${event.slug}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="h-1.5 bg-[#f5ca00]" />
              <img src={event.featured_image_url || fallbackImage(i)} alt={sv ? event.title_sv : event.title_en} className="w-full h-44 object-cover" loading="lazy" />
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#f5ca00] bg-[#FFF9EE] px-2 py-1 rounded-full">
                    {(() => {
                      const primary = sv ? event.cat_sv : event.cat_en;
                      const extras: Array<{slug: string; name_sv: string; name_en: string}> = event.extra_cats || [];
                      const allCats = [primary, ...extras.map((c: any) => sv ? c.name_sv : c.name_en)].filter(Boolean);
                      return allCats.length > 0 ? allCats.join(' · ') : (sv ? 'Evenemang' : 'Event');
                    })()}
                  </span>
                  {event.is_online && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Online</span>}
                </div>
                <h2 className="font-bold text-[#58595b] text-lg mb-2 leading-snug">{sv ? event.title_sv : event.title_en}</h2>
                <div className="text-sm text-gray-500 space-y-1 mb-4">
                  <p>{formatDate(event.starts_at)}</p>
                  <p>{event.venue || 'Yeshin Norbu, Stockholm'}</p>
                </div>
                <div className="mt-auto">
                  <span className="px-4 py-2 rounded-xl font-semibold text-sm bg-[#f5ca00] text-white hover:bg-[#d4af00] inline-block">{sv ? 'Läs mer' : 'Read more'}</span>
                </div>
              </div>
            </a>
          ))}
          {events.length === 0 && (
            <p className="col-span-3 text-center text-gray-400 py-12">{sv ? 'Inga evenemang hittades' : 'No events found'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
