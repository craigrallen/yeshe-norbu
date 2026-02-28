import { Pool } from 'pg';
import { notFound } from 'next/navigation';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function EventDetailPage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
  const sv = locale === 'sv';

  const { rows: [event] } = await pool.query(
    `SELECT e.*, ec.name_sv as cat_sv, ec.name_en as cat_en,
            v.name as venue_name, v.address as venue_address, v.city as venue_city,
            o.name as org_name, o.email as org_email, o.phone as org_phone
     FROM events e
     LEFT JOIN event_categories ec ON e.category_id = ec.id
     LEFT JOIN venues v ON e.venue_id = v.id
     LEFT JOIN organizers o ON e.organizer_id = o.id
     WHERE e.slug = $1 LIMIT 1`,
    [slug]
  );

  if (!event) notFound();

  const { rows: tickets } = await pool.query(
    'SELECT * FROM ticket_types WHERE event_id = $1 ORDER BY price_sek', [event.id]
  );

  const title = sv ? event.title_sv : event.title_en;
  const desc = sv ? event.description_sv : event.description_en;
  const catName = sv ? event.cat_sv : event.cat_en;

  function stripHtml(s: string) {
    return (s || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '–').replace(/&#8217;/g, "'").trim();
  }

  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;
  const sameDay = endDate && startDate.toDateString() === endDate.toDateString();

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      {event.featured_image_url && (
        <div className="w-full h-64 md:h-80 relative">
          <img src={event.featured_image_url} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <a href={`/${locale}/events`} className="text-sm text-blue-600 hover:underline">&larr; {sv ? 'Alla evenemang' : 'All events'}</a>
        </div>

        {catName && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-[#f5ca00] bg-[#FFF9EE] px-3 py-1 rounded-full mb-3">{catName}</span>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-[#58595b] mb-4">{title}</h1>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            {desc && (
              <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {stripHtml(desc)}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold text-gray-900 mb-3">{sv ? 'Detaljer' : 'Details'}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase">{sv ? 'Datum' : 'Date'}</p>
                  <p className="font-medium">{startDate.toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase">{sv ? 'Tid' : 'Time'}</p>
                  <p className="font-medium">
                    {startDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                    {endDate && ` \u2013 ${endDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                  {endDate && !sameDay && (
                    <p className="text-gray-500 text-xs">{sv ? 'till' : 'to'} {endDate.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase">{sv ? 'Plats' : 'Venue'}</p>
                  <p className="font-medium">{event.venue_name || event.venue || 'Yeshin Norbu, Stockholm'}</p>
                  {(event.venue_address || event.venue_city) && (
                    <p className="text-gray-500 text-xs">{[event.venue_address, event.venue_city].filter(Boolean).join(', ')}</p>
                  )}
                </div>
                {event.is_online && (
                  <div>
                    <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">{sv ? 'Online-evenemang' : 'Online event'}</span>
                  </div>
                )}
                {event.org_name && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase">{sv ? 'Arrangör' : 'Organizer'}</p>
                    <p className="font-medium">{event.org_name}</p>
                    {event.org_email && <p className="text-gray-500 text-xs">{event.org_email}</p>}
                  </div>
                )}
              </div>
            </div>

            {tickets.length > 0 && (
              <div className="bg-white rounded-xl border p-5">
                <h3 className="font-semibold text-gray-900 mb-3">{sv ? 'Biljetter' : 'Tickets'}</h3>
                <div className="space-y-2">
                  {tickets.map((t: any) => (
                    <div key={t.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{sv ? t.name_sv : t.name_en}</p>
                        {t.capacity && <p className="text-xs text-gray-400">{t.sold_count || 0}/{t.capacity} {sv ? 'sålda' : 'sold'}</p>}
                      </div>
                      <p className="font-semibold">{Number(t.price_sek) > 0 ? `${Math.round(Number(t.price_sek))} kr` : (sv ? 'Gratis' : 'Free')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <a href={`/${locale}/calendar`} className="block text-center text-sm text-blue-600 hover:underline py-2">
              {sv ? 'Visa kalender' : 'View calendar'} &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
