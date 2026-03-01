import type { Metadata } from 'next';
import { Pool } from 'pg';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/PageHero';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const content = {
  buddhism: {
    titleSv: 'Buddhism',
    titleEn: 'Buddhism',
    subtitleSv: 'Kurser inom tibetansk buddhistisk filosofi',
    subtitleEn: 'Courses in Tibetan Buddhist philosophy',
    bodySv: 'Våra buddhistiska kurser och event syftar till att ge näring åt medkänsla, visdom, vänlighet och sann lycka. Vi erbjuder introduktionskurser, Discovering Buddhism-programmet, retreatdagar och gruppraktik för både nybörjare och erfarna utövare.',
    bodyEn: 'Our Buddhist courses and events aim to nourish compassion, wisdom, kindness and genuine happiness. We offer introductory courses, the Discovering Buddhism program, retreat days and group practice for both beginners and experienced practitioners.',
    catSlug: 'buddhism',
  },
  mindfulness: {
    titleSv: 'Mindfulness',
    titleEn: 'Mindfulness',
    subtitleSv: 'Mindfulness och medkänsla för inre välmående',
    subtitleEn: 'Mindfulness and compassion for inner wellbeing',
    bodySv: 'Mindfulness-träning och meditation kan stärka fokus, medvetenhet och förmågan att hantera känslor. Vårt mål är att göra dessa tekniker tillgängliga för alla och till en naturlig del av livet.',
    bodyEn: 'Mindfulness training and meditation can strengthen focus, awareness and the ability to manage emotions. Our goal is to make these techniques accessible to everyone and a natural part of everyday life.',
    catSlug: 'mindfulness',
  },
  yoga: {
    titleSv: 'Yoga & Qigong',
    titleEn: 'Yoga & Qigong',
    subtitleSv: 'Återhämtande klasser för kropp och sinne',
    subtitleEn: 'Restorative classes for body and mind',
    bodySv: 'På centret ser vi fördelarna med att kombinera meditation med yoga och qigong. Klasserna hjälper dig att bygga kroppskännedom, återhämtning, bättre sömn och mental klarhet.',
    bodyEn: 'At the centre we see the benefits of combining meditation with yoga and qigong. These classes help build body awareness, recovery, better sleep and mental clarity.',
    catSlug: 'yoga',
  },
} as const;

export async function generateMetadata({ params: { locale, slug } }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  const c = (content as any)[slug];
  if (!c) return { title: sv ? 'Program' : 'Programme' };
  return {
    title: sv ? c.titleSv : c.titleEn,
    description: sv ? c.subtitleSv : c.subtitleEn,
  };
}

export default async function ProgramTrackPage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
  const sv = locale === 'sv';
  const c = (content as any)[slug];
  if (!c) return notFound();

  let events: any[] = [];
  try {
    const { rows } = await pool.query(
      `SELECT e.id, e.slug, e.title_sv, e.title_en, e.starts_at, e.venue, e.featured_image_url,
              ec.name_sv as cat_sv, ec.name_en as cat_en
       FROM events e
       LEFT JOIN event_categories ec ON e.category_id = ec.id
       WHERE e.published = true AND e.starts_at >= $1 AND ec.slug = $2
       ORDER BY e.starts_at ASC LIMIT 60`,
      [new Date().toISOString(), c.catSlug]
    );
    events = rows;
  } catch (e) {
    events = [];
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#1A1A1A]">
      <PageHero title={sv ? c.titleSv : c.titleEn} subtitle={sv ? c.subtitleSv : c.subtitleEn} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-charcoal-light text-lg max-w-4xl mb-8">{sv ? c.bodySv : c.bodyEn}</p>

        <div className="mb-8">
          <a href={`/${locale}/program`} className="text-sm text-brand hover:text-brand-dark">← {sv ? 'Tillbaka till Program' : 'Back to Programme'}</a>
        </div>

        {events.length === 0 ? (
          <p className="text-muted py-12 text-center">{sv ? 'Inga kommande evenemang i denna kategori just nu.' : 'No upcoming events in this category at the moment.'}</p>
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
