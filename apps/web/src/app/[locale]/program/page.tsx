import type { Metadata } from 'next';
import { Pool } from 'pg';
import { PageHero } from '@/components/PageHero';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Program' : 'Programme',
    description: sv ? 'Utforska Yeshin Norbus program — kurser, retreats och drop-in i meditation, mindfulness, yoga och buddhism.' : 'Explore Yeshin Norbu programme — courses, retreats and drop-in in meditation, mindfulness, yoga and Buddhism.',
  };
}

const tracks = [
  {
    slug: 'buddhism',
    titleSv: 'Buddhism',
    titleEn: 'Buddhism',
    descSv: 'Kurser, retreater och gruppraktik i tibetansk buddhistisk filosofi för både nybörjare och erfarna utövare.',
    descEn: 'Courses, retreats and group practice in Tibetan Buddhist philosophy for both beginners and experienced practitioners.',
  },
  {
    slug: 'mindfulness',
    titleSv: 'Mindfulness',
    titleEn: 'Mindfulness',
    descSv: 'Mindfulness och medkänsla som verktyg för inre välmående, fokus och emotionell balans i vardagen.',
    descEn: 'Mindfulness and compassion as tools for inner wellbeing, focus and emotional balance in everyday life.',
  },
  {
    slug: 'yoga',
    titleSv: 'Yoga & Qigong',
    titleEn: 'Yoga & Qigong',
    descSv: 'Återhämtande klasser som stärker kroppen, förbättrar sömn och hjälper dig att landa i närvaro.',
    descEn: 'Restorative classes that strengthen the body, improve sleep and help you settle into presence.',
  },
];

export default async function ProgramPage({ params: { locale }, searchParams }: { params: { locale: string }; searchParams: { cat?: string } }) {
  const sv = locale === 'sv';
  const catFilter = searchParams.cat || '';

  let categories: any[] = [];
  let events: any[] = [];

  try {
    const c = await pool.query('SELECT id, slug, name_sv, name_en FROM event_categories ORDER BY name_sv');
    categories = c.rows;

    const params: any[] = [new Date().toISOString()];
    let query = `
      SELECT e.id, e.slug, e.title_sv, e.title_en, e.starts_at, e.venue, e.featured_image_url,
             ec.name_sv as cat_sv, ec.name_en as cat_en, ec.slug as cat_slug
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      WHERE e.published = true AND e.starts_at >= $1
    `;

    if (catFilter) {
      params.push(catFilter);
      query += ` AND ec.slug = $${params.length}`;
    }

    query += ' ORDER BY e.starts_at ASC LIMIT 100';
    const r = await pool.query(query, params);
    events = r.rows;
  } catch (e) {
    categories = [];
    events = [];
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <PageHero
        title={sv ? 'Program' : 'Programme'}
        subtitle={sv ? 'Kurser, retreater och drop-in i meditation, mindfulness och buddhism.' : 'Courses, retreats and drop-in sessions in meditation, mindfulness and Buddhism.'}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {tracks.map((t) => (
            <a key={t.slug} href={`/${locale}/program/${t.slug}`} className="block rounded-2xl border border-[#E8E4DE] bg-white p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
              <h3 className="font-serif text-2xl font-semibold text-charcoal mb-2">{sv ? t.titleSv : t.titleEn}</h3>
              <p className="text-sm text-charcoal-light">{sv ? t.descSv : t.descEn}</p>
              <span className="inline-block mt-4 text-brand-dark text-sm font-medium">{sv ? 'Läs mer →' : 'Read more →'}</span>
            </a>
          ))}
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          <a href={`/${locale}/program`} className={`px-4 py-2 rounded-full text-sm font-medium border ${!catFilter ? 'bg-[#E8B817] text-white border-[#E8B817]' : 'bg-white text-[#58595b] border-gray-200'}`}>
            {sv ? 'Alla kategorier' : 'All categories'}
          </a>
          {categories.map((c) => (
            <a key={c.id} href={`/${locale}/program?cat=${c.slug}`} className={`px-4 py-2 rounded-full text-sm font-medium border ${catFilter === c.slug ? 'bg-[#E8B817] text-white border-[#E8B817]' : 'bg-white text-[#58595b] border-gray-200'}`}>
              {sv ? c.name_sv : c.name_en}
            </a>
          ))}
        </div>

        {events.length === 0 ? (
          <p className="text-muted py-12 text-center">{sv ? 'Inga kommande evenemang just nu.' : 'No upcoming events at the moment.'}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event: any, i: number) => (
              <a key={event.id} href={`/${locale}/events/${event.slug}`} className="block rounded-lg border border-border bg-white overflow-hidden hover:shadow-md transition-shadow">
                <img src={event.featured_image_url || (i % 2 === 0 ? '/events/wisdom-retreat.jpg' : '/events/geshe-sherab.jpg')} alt={sv ? event.title_sv : (event.title_en || event.title_sv)} className="w-full h-44 object-cover" />
                <div className="p-5">
                  <p className="text-xs text-brand font-medium mb-1">{sv ? event.cat_sv : (event.cat_en || event.cat_sv)}</p>
                  <h3 className="text-base font-semibold text-primary mb-2">{sv ? event.title_sv : (event.title_en || event.title_sv)}</h3>
                  <p className="text-sm text-muted">{new Date(event.starts_at).toLocaleDateString(sv ? 'sv-SE' : 'en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <p className="text-sm text-muted">{event.venue || 'Yeshin Norbu'}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
