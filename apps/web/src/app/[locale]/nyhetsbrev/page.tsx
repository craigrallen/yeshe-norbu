import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Nyhetsbrev' : 'Newsletter',
    description: sv ? 'Prenumerera på Yeshin Norbus nyhetsbrev och få uppdateringar om kurser, retreats och evenemang.' : 'Subscribe to Yeshin Norbu newsletter for updates on courses, retreats and events.',
  };
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  return (
    <div className="pt-[72px]">
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal dark:text-[#E8E4DE] mb-6">{sv ? 'Nyhetsbrev' : 'Newsletter'}</h1>
        <div className="gold-bar mb-8" />
        <div className="prose prose-lg text-charcoal-light leading-relaxed whitespace-pre-line">
          {sv ? `Håll dig uppdaterad med det senaste från Yeshin Norbu. Prenumerera på vårt nyhetsbrev för att få information om kommande evenemang, kurser och nyheter.` : `Stay updated with the latest from Yeshin Norbu. Subscribe to our newsletter for information about upcoming events, courses and news.`}
        </div>
      </section>
    </div>
  );
}
