import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Besök oss' : 'Visit Us',
    description: sv ? 'Hitta till Yeshin Norbu på Roslagsgatan 62 i Stockholm. Öppettider, vägbeskrivning och praktisk information.' : 'Find Yeshin Norbu at Roslagsgatan 62 in Stockholm. Opening hours, directions and practical information.',
  };
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  return (
    <div className="pt-[72px]">
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal mb-6">{sv ? 'Besök oss' : 'Visit Us'}</h1>
        <div className="gold-bar mb-8" />
        <div className="prose prose-lg text-charcoal-light leading-relaxed whitespace-pre-line">
          {sv ? `Yeshin Norbu Meditationscenter ligger på Roslagsgatan 62 i Stockholm, nära Roslagstull och i närheten av KTH, Stockholms universitet och Karolinska institutet.` : `Yeshin Norbu Meditation Centre is located at Roslagsgatan 62 in Stockholm, near Roslagstull and close to KTH, Stockholm University and Karolinska Institute.`}
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-8">
            <a href={`/${locale}/forsta-besoket`} className="block rounded-2xl border border-[#E8E4DE] bg-white p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
              <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">{sv ? 'Ditt första besök' : 'Your First Visit'}</h3>
              <span className="text-brand-dark text-sm font-medium">{sv ? 'Läs mer →' : 'Read more →'}</span>
            </a>
            <a href={`/${locale}/cafe`} className="block rounded-2xl border border-[#E8E4DE] bg-white p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
              <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">{sv ? 'Café & Bibliotek' : 'Café & Library'}</h3>
              <span className="text-brand-dark text-sm font-medium">{sv ? 'Läs mer →' : 'Read more →'}</span>
            </a>
            <a href={`/${locale}/lokalhyra`} className="block rounded-2xl border border-[#E8E4DE] bg-white p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
              <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">{sv ? 'Lokalhyra' : 'Venue Hire'}</h3>
              <span className="text-brand-dark text-sm font-medium">{sv ? 'Läs mer →' : 'Read more →'}</span>
            </a>
        </div>
      </section>
    </div>
  );
}
