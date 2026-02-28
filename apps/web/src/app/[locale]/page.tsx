import { getTranslations } from 'next-intl/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const blogPosts = [
  { slug: 'fpmt-och-yeshe-norbu', title: 'FPMT och Yeshin Norbu', titleEn: 'FPMT and Yeshin Norbu', excerpt: 'Lär dig om FPMT och hur Yeshin Norbu i Stockholm är en del av detta globala andliga nätverk.', excerptEn: 'Learn about FPMT and Yeshin Norbu Stockholm as part of this global spiritual network.', category: 'Undervisning', categoryEn: 'Teaching' },
  { slug: 'mindfulness-i-vardagen', title: 'Mindfulness i vardagen', titleEn: 'Mindfulness in Daily Life', excerpt: 'Fem konkreta mindfulnessövningar för dig som vill skapa mer närvaro i vardagen.', excerptEn: 'Five practical mindfulness exercises for creating more presence in daily life.', category: 'Mindfulness', categoryEn: 'Mindfulness' },
  { slug: 'vad-ar-meditation', title: 'Vad är meditation?', titleEn: 'What is Meditation?', excerpt: 'Meditation är inte att tömma sinnet. Det är att träna uppmärksamheten.', excerptEn: 'Meditation is not emptying the mind. It is training attention.', category: 'Undervisning', categoryEn: 'Teaching' },
];

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const sv = locale === 'sv';

  const { rows: featuredEvents } = await pool.query(
    `SELECT id, slug,
            COALESCE(NULLIF(title_sv,''), title_en) as title_sv_fallback,
            COALESCE(NULLIF(title_en,''), title_sv) as title_en_fallback,
            starts_at, venue, featured_image_url
     FROM events
     WHERE published = true
       AND starts_at >= now()
       AND coalesce(
         nullif(to_jsonb(events)->>'featured','')::boolean,
         nullif(to_jsonb(events)->>'is_featured','')::boolean,
         nullif(to_jsonb(events)->>'wp_featured','')::boolean,
         nullif(to_jsonb(events)->>'tribe_featured','')::boolean,
         false
       ) = true
     ORDER BY starts_at ASC
     LIMIT 3`
  );

  const upcomingEvents = featuredEvents.length
    ? featuredEvents
    : (await pool.query(
      `SELECT id, slug,
              COALESCE(NULLIF(title_sv,''), title_en) as title_sv_fallback,
              COALESCE(NULLIF(title_en,''), title_sv) as title_en_fallback,
              starts_at, venue, featured_image_url
       FROM events
       WHERE published = true AND starts_at >= now()
       ORDER BY starts_at ASC
       LIMIT 3`
    )).rows;

  const { rows: plans } = await pool.query(
    `SELECT id, slug, name_sv, name_en, price_sek, interval_months
     FROM membership_plans
     WHERE active = true
     ORDER BY price_sek ASC`
  );

  const membershipTiers = plans.slice(0, 3).map((p: any) => ({
    slug: p.slug,
    name: p.name_sv,
    nameEn: p.name_en,
    price: `${Math.round(Number(p.price_sek)).toLocaleString('sv-SE')} kr/${p.interval_months === 12 ? 'år' : 'mån'}`,
    priceEn: `${Math.round(Number(p.price_sek)).toLocaleString('sv-SE')} SEK/${p.interval_months === 12 ? 'year' : 'month'}`,
    popular: p.slug === 'gym-card',
    benefits: p.slug === 'gym-card'
      ? ['Obegränsad drop-in', 'Alla veckliga klasser', 'Prioriterad plats på retreat']
      : p.slug === 'friend'
      ? ['Stöd centrets arbete', 'Nyhetsbrev', 'Exklusiva aktiviteter']
      : ['Tillgång till centrets medlemsförmåner', 'Nyhetsbrev', 'Rabatter'],
    benefitsEn: p.slug === 'gym-card'
      ? ['Unlimited drop-in', 'All weekly classes', 'Priority retreat booking']
      : p.slug === 'friend'
      ? ['Support the centre', 'Newsletter', 'Exclusive activities']
      : ['Access to member benefits', 'Newsletter', 'Discounts'],
  }));

  return (
    <div className="space-y-20">
      <section className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">{t('heroTitle')}</h1>
        <p className="text-xl md:text-2xl text-muted mb-4">{t('heroSubtitle')}</p>
        <p className="max-w-2xl mx-auto text-base text-muted leading-relaxed mb-8">{t('heroDescription')}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href={`/${locale}/events`} className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark transition-colors text-base">{sv ? 'Kommande evenemang' : 'Upcoming Events'}</a>
          <a href={`/${locale}/bli-medlem`} className="inline-flex items-center justify-center h-12 px-8 rounded-lg border-2 border-brand text-brand font-medium hover:bg-brand hover:text-white transition-colors text-base">{sv ? 'Bli medlem' : 'Become a Member'}</a>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary">{sv ? 'Utvalda evenemang' : 'Featured Events'}</h2>
          <a href={`/${locale}/events`} className="text-sm text-brand hover:text-brand-dark font-medium">{sv ? 'Visa alla' : 'View all'} →</a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {upcomingEvents.map((e: any) => (
            <a key={e.id} href={e.slug ? `/${locale}/events/${e.slug}` : `/${locale}/events`} className="rounded-xl border border-border bg-surface overflow-hidden hover:shadow-md transition-shadow block">
              <img src={e.featured_image_url || '/events/wisdom-retreat.jpg'} alt={sv ? e.title_sv_fallback : e.title_en_fallback} className="w-full h-40 object-cover" loading="lazy" />
              <div className="p-6">
                <h3 className="font-semibold text-primary text-lg mb-2">{sv ? e.title_sv_fallback : e.title_en_fallback}</h3>
                <div className="space-y-1 text-sm text-muted mb-4">
                  <div>{new Date(e.starts_at).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', timeZone: 'Europe/Stockholm' })} · {new Date(e.starts_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm' })}</div>
                  <div>{e.venue || 'Yeshin Norbu, Stockholm'}</div>
                </div>
                <div className="flex justify-end items-center pt-3 border-t border-border">
                  <span className="text-sm text-brand hover:text-brand-dark font-medium">{sv ? 'Läs mer' : 'Read more'} →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary">{sv ? 'Från bloggen' : 'From the Blog'}</h2>
          <a href={`/${locale}/blog`} className="text-sm text-brand hover:text-brand-dark font-medium">{sv ? 'Alla artiklar' : 'All articles'} →</a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {blogPosts.map((p) => (
            <a key={p.slug} href={`/${locale}/blog/${p.slug}`} className="group">
              <div className="rounded-xl border border-border bg-surface overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100" />
                <div className="p-5">
                  <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{sv ? p.category : p.categoryEn}</span>
                  <h3 className="font-semibold text-primary mt-3 mb-2 group-hover:text-brand transition-colors">{sv ? p.title : p.titleEn}</h3>
                  <p className="text-sm text-muted leading-relaxed">{sv ? p.excerpt : p.excerptEn}</p>
                  <div className="mt-4 text-sm text-brand font-medium">{sv ? 'Läs mer' : 'Read more'} →</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3">{sv ? 'Bli medlem' : 'Become a Member'}</h2>
          <p className="text-muted max-w-xl mx-auto">{sv ? 'Stöd centrets arbete och få tillgång till exklusiva förmåner.' : 'Support the centre and get access to exclusive benefits.'}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {membershipTiers.map((tier) => (
            <div key={tier.slug} className={`rounded-xl bg-white p-6 border-2 ${tier.popular ? 'border-brand shadow-lg' : 'border-border'}`}>
              {tier.popular && <div className="text-xs font-semibold text-brand uppercase tracking-wide mb-3">{sv ? 'Populärast' : 'Most popular'}</div>}
              <h3 className="text-xl font-bold text-primary mb-1">{sv ? tier.name : tier.nameEn}</h3>
              <p className="text-2xl font-bold text-brand mb-4">{sv ? tier.price : tier.priceEn}</p>
              <ul className="space-y-2 mb-6">
                {(sv ? tier.benefits : tier.benefitsEn).map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted"><span className="text-green-500 mt-0.5">•</span><span>{b}</span></li>
                ))}
              </ul>
              <a href={`/${locale}/bli-medlem`} className={`block text-center py-2.5 rounded-lg font-medium transition-colors ${tier.popular ? 'bg-brand text-white hover:bg-brand-dark' : 'border border-brand text-brand hover:bg-brand hover:text-white'}`}>{sv ? 'Välj plan' : 'Choose plan'}</a>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center py-6">
        <p className="text-sm text-muted">{sv ? 'Affilierat med ' : 'Affiliated with '}<a href="https://fpmt.org" className="text-brand hover:underline font-medium">FPMT – Foundation for the Preservation of the Mahayana Tradition</a></p>
      </section>
    </div>
  );
}
