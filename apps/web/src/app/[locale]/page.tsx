import { getTranslations } from 'next-intl/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const sv = locale === 'sv';

  const { rows: featuredSettingRows } = await pool.query("SELECT value FROM app_settings WHERE key='events.featured_ids' LIMIT 1");
  const featuredIds: string[] = featuredSettingRows?.[0]?.value || [];

  const featuredEvents = featuredIds.length
    ? (await pool.query(
      `SELECT e.id, e.slug,
              COALESCE(NULLIF(e.title_sv,''), e.title_en) as title,
              COALESCE(NULLIF(e.title_en,''), e.title_sv) as title_en,
              e.starts_at, e.ends_at, e.venue, e.featured_image_url,
              COALESCE(NULLIF(ec.name_sv,''), ec.name_en) as cat_sv,
              COALESCE(NULLIF(ec.name_en,''), ec.name_sv) as cat_en
       FROM events e
       LEFT JOIN event_categories ec ON e.category_id = ec.id
       WHERE e.published = true AND e.starts_at >= now() AND e.id = ANY($1::uuid[])
       ORDER BY e.starts_at ASC LIMIT 3`,
      [featuredIds]
    )).rows
    : [];

  const upcomingEvents = featuredEvents.length ? featuredEvents : (await pool.query(
    `SELECT e.id, e.slug,
            COALESCE(NULLIF(e.title_sv,''), e.title_en) as title,
            COALESCE(NULLIF(e.title_en,''), e.title_sv) as title_en,
            e.starts_at, e.ends_at, e.venue, e.featured_image_url,
            COALESCE(NULLIF(ec.name_sv,''), ec.name_en) as cat_sv,
            COALESCE(NULLIF(ec.name_en,''), ec.name_sv) as cat_en
     FROM events e
     LEFT JOIN event_categories ec ON e.category_id = ec.id
     WHERE e.published = true AND e.starts_at >= now()
     ORDER BY e.starts_at ASC LIMIT 3`
  )).rows;

  const { rows: plans } = await pool.query(
    `SELECT id, slug, name_sv, name_en, price_sek, interval_months
     FROM membership_plans WHERE active = true ORDER BY price_sek ASC`
  );

  const categories = [
    { title: 'Buddhism', titleEn: 'Buddhism', sub: 'Kurser · Retreats · Drop-in', subEn: 'Courses · Retreats · Drop-in', img: '/brand/buddhism.jpg', href: `/${locale}/program` },
    { title: 'Mindfulness & Medkänsla', titleEn: 'Mindfulness & Compassion', sub: 'Kurser · Retreats · Drop-in', subEn: 'Courses · Retreats · Drop-in', img: '/brand/mindfulness.jpg', href: `/${locale}/program` },
    { title: 'Yoga & Qigong', titleEn: 'Yoga & Qigong', sub: 'Iyengar · Yin · Qigong', subEn: 'Iyengar · Yin · Qigong', img: '/brand/yoga.jpg', href: `/${locale}/program` },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden mt-[72px]">
        <div className="absolute inset-0">
          <img id="hero-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-seasonal="true" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/40 to-transparent" />
        {/* Circles motif */}
        <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 opacity-[0.08]">
          <svg width="600" height="600" viewBox="0 0 400 400"><circle cx="200" cy="180" r="180" stroke="#E8B817" strokeWidth="3" fill="none"/><circle cx="210" cy="210" r="130" stroke="#E8B817" strokeWidth="3" fill="none"/><circle cx="218" cy="235" r="80" stroke="#E8B817" strokeWidth="3" fill="none"/></svg>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-xl mb-5">
            {sv ? <>Förändra ditt sinne, <span className="text-brand-light">förändra din värld</span></> : <>Transform your mind, <span className="text-brand-light">transform your world</span></>}
          </h1>
          <p className="text-white/85 text-lg max-w-md leading-relaxed mb-8">
            {sv ? 'Meditation, mindfulness och buddhistisk filosofi i hjärtat av Stockholm.' : 'Meditation, mindfulness and Buddhist philosophy in the heart of Stockholm.'}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href={`/${locale}/events`} className="btn-gold">{sv ? 'Utforska programmet →' : 'Explore programme →'}</a>
            <a href={`/${locale}/forsta-besoket`} className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white border-2 border-white/40 hover:border-brand hover:text-brand transition-all">{sv ? 'Ditt första besök' : 'Your first visit'}</a>
          </div>
        </div>
        {/* Seasonal hero script */}
        <script dangerouslySetInnerHTML={{__html:`
          fetch('/seasons/manifest.json').then(r=>r.json()).then(d=>{
            var m=new Date().getMonth()+1,p=m<10?'0'+m:String(m),imgs=d[p]||d['03'];
            if(imgs&&imgs.length){document.getElementById('hero-img').src=imgs[Math.floor(Math.random()*imgs.length)];}
          }).catch(()=>{});
        `}} />
      </section>

      {/* FEATURED EVENTS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-charcoal mb-3">{sv ? 'Kommande höjdpunkter' : 'Upcoming Highlights'}</h2>
          <p className="text-charcoal-light text-lg max-w-lg mx-auto">{sv ? 'Upptäck våra utvalda evenemang och kurser' : 'Discover our featured events and courses'}</p>
          <div className="gold-bar mx-auto mt-4" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {upcomingEvents.map((e: any) => (
            <a key={e.id} href={e.slug ? `/${locale}/events/${e.slug}` : `/${locale}/events`} className="bg-white rounded-2xl overflow-hidden border border-[#E8E4DE] hover:-translate-y-1 hover:shadow-xl transition-all block group">
              <div className="h-[200px] overflow-hidden relative">
                <img src={e.featured_image_url || '/brand/courses.jpg'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                {featuredIds.includes(e.id) && <span className="absolute top-3 left-3 bg-brand text-charcoal text-[11px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">{sv ? 'Utvald' : 'Featured'}</span>}
                {(e.cat_sv || e.cat_en) && <span className="absolute top-3 right-3 bg-charcoal/70 text-white text-[11px] px-2.5 py-1 rounded-md">{sv ? e.cat_sv : e.cat_en}</span>}
              </div>
              <div className="p-5">
                <div className="text-brand-dark text-[13px] font-semibold mb-1">
                  {new Date(e.starts_at).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(e.starts_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm' })}
                </div>
                <h3 className="font-serif text-xl font-semibold text-charcoal mb-2">{sv ? e.title : e.title_en}</h3>
                <p className="text-sm text-charcoal-light">{e.venue || 'Yeshin Norbu, Stockholm'}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-8">
          <a href={`/${locale}/events`} className="btn-outline">{sv ? 'Visa alla evenemang →' : 'View all events →'}</a>
        </div>
      </section>

      {/* MISSION / ABOUT */}
      <section className="bg-charcoal text-white relative overflow-hidden">
        <div className="absolute left-[-120px] bottom-[-120px] opacity-[0.06]">
          <svg width="400" height="400" viewBox="0 0 400 400"><circle cx="200" cy="180" r="180" stroke="#E8B817" strokeWidth="2" fill="none"/><circle cx="210" cy="210" r="130" stroke="#E8B817" strokeWidth="2" fill="none"/><circle cx="218" cy="235" r="80" stroke="#E8B817" strokeWidth="2" fill="none"/></svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-brand-light mb-2">{sv ? 'Vår vision' : 'Our Vision'}</h2>
              <div className="gold-bar mt-4 mb-6" />
              <p className="text-white/85 text-lg leading-relaxed mb-4">
                {sv
                  ? 'Yeshin Norbu Meditationscenter är en ideell organisation inspirerad av Dalai Lamas vision om sekulär och universell etik. Vi erbjuder kurser som främjar mentalt och fysiskt välbefinnande — meditation, mindfulness, yoga och autentisk buddhistisk filosofi.'
                  : 'Yeshin Norbu Meditation Centre is a non-profit organisation inspired by the Dalai Lama\'s vision of secular and universal ethics. We offer courses promoting mental and physical well-being — meditation, mindfulness, yoga and authentic Buddhist philosophy.'}
              </p>
              <p className="text-white/70 leading-relaxed mb-8">
                {sv ? 'Att träna sinnet är lika viktigt som att träna kroppen.' : 'Training the mind is as important as training the body.'}
              </p>
              <a href={`/${locale}/om-oss`} className="btn-gold">{sv ? 'Läs mer om oss →' : 'Learn more →'}</a>
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img src="/brand/stupa.jpg" alt="Center stupa" className="w-full" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-charcoal mb-3">{sv ? 'Utforska vårt utbud' : 'Explore Our Offerings'}</h2>
          <p className="text-charcoal-light text-lg max-w-lg mx-auto">{sv ? 'Kurser och event för alla nivåer och intressen' : 'Courses and events for all levels and interests'}</p>
          <div className="gold-bar mx-auto mt-4" />
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {categories.map(c => (
            <a key={c.title} href={c.href} className="relative rounded-2xl overflow-hidden h-[280px] group block">
              <img src={c.img} alt="" className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white font-serif text-2xl font-semibold mb-1">{sv ? c.title : c.titleEn}</h3>
                <span className="text-brand-light text-sm font-medium">{sv ? c.sub : c.subEn}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SUPPORT CTA */}
      <section className="bg-gradient-to-br from-brand to-brand-dark py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-charcoal mb-3">{sv ? 'Stöd centret' : 'Support the Centre'}</h2>
          <p className="text-charcoal-light mb-8">
            {sv ? 'Bli medlem och få tillgång till rabatter, nyhetsbrev och möjlighet att påverka centrets framtid. Från 250 kr/år.' : 'Become a member for discounts, newsletters and a voice in the centre\'s future. From 250 SEK/year.'}
          </p>
          <a href={`/${locale}/bli-medlem`} className="btn-charcoal">{sv ? 'Bli medlem →' : 'Join now →'}</a>
        </div>
      </section>

      {/* MEMBERSHIP PLANS */}
      {plans.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-3">{sv ? 'Medlemskap' : 'Membership Plans'}</h2>
            <div className="gold-bar mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.slice(0, 3).map((p: any) => (
              <div key={p.id} className={`rounded-2xl bg-white p-7 border-2 ${p.slug === 'gym-card' ? 'border-brand shadow-lg' : 'border-[#E8E4DE]'}`}>
                {p.slug === 'gym-card' && <div className="text-xs font-bold text-brand uppercase tracking-wide mb-2">{sv ? 'Populärast' : 'Most popular'}</div>}
                <h3 className="font-serif text-xl font-bold text-charcoal mb-1">{sv ? p.name_sv : p.name_en}</h3>
                <p className="text-2xl font-bold text-brand mb-5">{Math.round(Number(p.price_sek))} kr/{p.interval_months === 12 ? (sv ? 'år' : 'year') : (sv ? 'mån' : 'mo')}</p>
                <a href={`/${locale}/bli-medlem`} className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${p.slug === 'gym-card' ? 'btn-gold w-full' : 'btn-outline w-full'}`}>{sv ? 'Välj plan' : 'Choose plan'}</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FPMT */}
      <section className="text-center py-8 px-4">
        <p className="text-sm text-charcoal-light">
          {sv ? 'Affilierat med ' : 'Affiliated with '}
          <a href="https://fpmt.org" className="text-brand hover:underline font-medium">FPMT – Foundation for the Preservation of the Mahayana Tradition</a>
        </p>
      </section>
    </div>
  );
}
