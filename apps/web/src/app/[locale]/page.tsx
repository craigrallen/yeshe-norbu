import { getTranslations } from 'next-intl/server';

const upcomingEvents = [
  { id: 1, title: 'Introduktion till Mindfulness', titleEn: 'Introduction to Mindfulness', date: '4 mars', dateEn: '4 March', time: '18:30', location: 'Yeshin Norbu Center', price: 'Gratis', priceEn: 'Free', emoji: '' },
  { id: 2, title: 'Lam Rim – vecka 3', titleEn: 'Lam Rim – week 3', date: '6 mars', dateEn: '6 March', time: '19:00', location: 'Online', price: '150 kr', priceEn: '150 SEK', emoji: '' },
  { id: 3, title: 'Retreat: Tystnadens kraft', titleEn: 'Retreat: The Power of Silence', date: '14–16 mars', dateEn: '14–16 March', time: 'Helg', location: 'Utanför Stockholm', price: '2 500 kr', priceEn: '2,500 SEK', emoji: '' },
];

const blogPosts = [
  { slug: 'fpmt-och-yeshe-norbu', title: 'FPMT och Yeshin Norbu', titleEn: 'FPMT and Yeshin Norbu', excerpt: 'Lär dig om FPMT och hur Yeshin Norbu i Stockholm är en del av detta globala andliga nätverk.', excerptEn: 'Learn about FPMT and Yeshin Norbu Stockholm as part of this global spiritual network.', category: 'Undervisning', categoryEn: 'Teaching' },
  { slug: 'mindfulness-i-vardagen', title: 'Mindfulness i vardagen', titleEn: 'Mindfulness in Daily Life', excerpt: 'Fem konkreta mindfulnessövningar för dig som vill skapa mer närvaro i vardagen.', excerptEn: 'Five practical mindfulness exercises for creating more presence in daily life.', category: 'Mindfulness', categoryEn: 'Mindfulness' },
  { slug: 'vad-ar-meditation', title: 'Vad är meditation?', titleEn: 'What is Meditation?', excerpt: 'Meditation är inte att tömma sinnet. Det är att träna uppmärksamheten.', excerptEn: 'Meditation is not emptying the mind. It is training attention.', category: 'Undervisning', categoryEn: 'Teaching' },
];

const membershipTiers = [
  { name: 'Vän', nameEn: 'Friend', price: 'från 150 kr/år', priceEn: 'from 150 SEK/year', benefits: ['Tillgång till exklusiva evenemang', 'Nyhetsbrev', 'Stöd centrets arbete'], benefitsEn: ['Access to exclusive events', 'Newsletter', 'Support the centre\'s work'] },
  { name: 'Non-Profit', nameEn: 'Non-Profit', price: '500 kr/år', priceEn: '500 SEK/year', popular: true, benefits: ['Alla Vän-förmåner', 'Rabatt på kurser', 'Gratis drop-in meditation'], benefitsEn: ['All Friend benefits', 'Course discounts', 'Free drop-in meditation'] },
  { name: 'Mentalt Gymkort', nameEn: 'Mental Gym Card', price: '299 kr/mån', priceEn: '299 SEK/month', benefits: ['Obegränsad drop-in', 'Alla veckliga klasser', 'Prioriterad plats på retreat'], benefitsEn: ['Unlimited drop-in', 'All weekly classes', 'Priority retreat booking'] },
];

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const sv = locale === 'sv';

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center py-16 md:py-24">
        <div className="inline-block text-6xl mb-6"></div>
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">{t('heroTitle')}</h1>
        <p className="text-xl md:text-2xl text-muted mb-4">{t('heroSubtitle')}</p>
        <p className="max-w-2xl mx-auto text-base text-muted leading-relaxed mb-8">{t('heroDescription')}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href={`/${locale}/events`} className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark transition-colors text-base">
            {sv ? 'Kommande evenemang' : 'Upcoming Events'}
          </a>
          <a href={`/${locale}/bli-medlem`} className="inline-flex items-center justify-center h-12 px-8 rounded-lg border-2 border-brand text-brand font-medium hover:bg-brand hover:text-white transition-colors text-base">
            {sv ? 'Bli medlem' : 'Become a Member'}
          </a>
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary">{sv ? 'Kommande evenemang' : 'Upcoming Events'}</h2>
          <a href={`/${locale}/events`} className="text-sm text-brand hover:text-brand-dark font-medium">
            {sv ? 'Visa alla' : 'View all'} →
          </a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {upcomingEvents.map((e) => (
            <div key={e.id} className="rounded-xl border border-border bg-surface p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{e.emoji}</div>
              <h3 className="font-semibold text-primary text-lg mb-2">{sv ? e.title : e.titleEn}</h3>
              <div className="space-y-1 text-sm text-muted mb-4">
                <div>{sv ? e.date : e.dateEn} · {e.time}</div>
                <div>{e.location}</div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-medium text-primary">{sv ? e.price : e.priceEn}</span>
                <a href={`/${locale}/events`} className="text-sm text-brand hover:text-brand-dark font-medium">
                  {sv ? 'Anmäl dig' : 'Register'} →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto text-center bg-amber-50 rounded-2xl p-10">
        <div className="text-5xl mb-4"></div>
        <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">{t('ourMission')}</h2>
        <p className="text-base text-muted leading-relaxed">{t('missionText')}</p>
      </section>

      {/* Latest Blog Posts */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary">{sv ? 'Från bloggen' : 'From the Blog'}</h2>
          <a href={`/${locale}/blog`} className="text-sm text-brand hover:text-brand-dark font-medium">
            {sv ? 'Alla artiklar' : 'All articles'} →
          </a>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {blogPosts.map((p) => (
            <a key={p.slug} href={`/${locale}/blog/${p.slug}`} className="group">
              <div className="rounded-xl border border-border bg-surface overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-5xl"></div>
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

      {/* Membership */}
      <section className="bg-gray-50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-3">{sv ? 'Bli medlem' : 'Become a Member'}</h2>
          <p className="text-muted max-w-xl mx-auto">{sv ? 'Stöd centrets arbete och få tillgång till exklusiva förmåner.' : 'Support the centre and get access to exclusive benefits.'}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {membershipTiers.map((tier) => (
            <div key={tier.name} className={`rounded-xl bg-white p-6 border-2 ${tier.popular ? 'border-brand shadow-lg' : 'border-border'}`}>
              {tier.popular && <div className="text-xs font-semibold text-brand uppercase tracking-wide mb-3">{sv ? 'Populärast' : 'Most popular'}</div>}
              <h3 className="text-xl font-bold text-primary mb-1">{sv ? tier.name : tier.nameEn}</h3>
              <p className="text-2xl font-bold text-brand mb-4">{sv ? tier.price : tier.priceEn}</p>
              <ul className="space-y-2 mb-6">
                {(sv ? tier.benefits : tier.benefitsEn).map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <a href={`/${locale}/bli-medlem`} className={`block text-center py-2.5 rounded-lg font-medium transition-colors ${tier.popular ? 'bg-brand text-white hover:bg-brand-dark' : 'border border-brand text-brand hover:bg-brand hover:text-white'}`}>
                {sv ? 'Välj plan' : 'Choose plan'}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FPMT affiliation */}
      <section className="text-center py-6">
        <p className="text-sm text-muted">
          {sv ? 'Affilierat med ' : 'Affiliated with '}
          <a href="https://fpmt.org" className="text-brand hover:underline font-medium">
            FPMT – Foundation for the Preservation of the Mahayana Tradition
          </a>
        </p>
      </section>
    </div>
  );
}
