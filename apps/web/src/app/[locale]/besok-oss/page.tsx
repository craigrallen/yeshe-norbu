import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';

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
    <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#1A1A1A]">
      <PageHero
        title={sv ? 'Besök oss' : 'Visit Us'}
        subtitle={sv ? 'Hitta till oss på Roslagsgatan 62 i Stockholm' : 'Find us at Roslagsgatan 62 in Stockholm'}
      />
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="prose prose-lg text-charcoal dark:text-[#E8E4DE] leading-relaxed whitespace-pre-line mb-8">
          {sv ? `Yeshin Norbu Meditationscenter ligger på Roslagsgatan 62 i Stockholm, nära Roslagstull och i närheten av KTH, Stockholms universitet och Karolinska institutet.` : `Yeshin Norbu Meditation Centre is located at Roslagsgatan 62 in Stockholm, near Roslagstull and close to KTH, Stockholm University and Karolinska Institute.`}
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-8">
            <a href={`/${locale}/forsta-besoket`} className="block rounded-2xl border border-[#E8E4DE] dark:border-[#3D3D3D] bg-white dark:bg-[#2A2A2A] p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
              <h3 className="font-serif text-xl font-semibold text-charcoal dark:text-[#E8E4DE] mb-1">{sv ? 'Ditt första besök' : 'Your First Visit'}</h3>
              <span className="text-brand-dark text-sm font-medium">{sv ? 'Läs mer →' : 'Read more →'}</span>
            </a>
            <a href={`/${locale}/cafe`} className="block rounded-2xl border border-[#E8E4DE] dark:border-[#3D3D3D] bg-white dark:bg-[#2A2A2A] p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
              <h3 className="font-serif text-xl font-semibold text-charcoal dark:text-[#E8E4DE] mb-1">{sv ? 'Café & Bibliotek' : 'Café & Library'}</h3>
              <span className="text-brand-dark text-sm font-medium">{sv ? 'Läs mer →' : 'Read more →'}</span>
            </a>
            <a href={`/${locale}/lokalhyra`} className="block rounded-2xl border border-[#E8E4DE] dark:border-[#3D3D3D] bg-white dark:bg-[#2A2A2A] p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
              <h3 className="font-serif text-xl font-semibold text-charcoal dark:text-[#E8E4DE] mb-1">{sv ? 'Lokalhyra' : 'Venue Hire'}</h3>
              <span className="text-brand-dark text-sm font-medium">{sv ? 'Läs mer →' : 'Read more →'}</span>
            </a>
        </div>
      </section>
    </div>
  );
}
