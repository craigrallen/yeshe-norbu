import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';

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
    <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#1A1A1A]">
      <PageHero
        title={sv ? 'Nyhetsbrev' : 'Newsletter'}
        subtitle={sv ? 'Håll dig uppdaterad med det senaste från Yeshin Norbu' : 'Stay updated with the latest from Yeshin Norbu'}
      />
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="prose prose-lg dark:prose-invert text-charcoal-light dark:text-[#C0BAB0] leading-relaxed">
          <p>{sv ? 'Prenumerera på vårt nyhetsbrev för att få information om kommande evenemang, kurser och nyheter.' : 'Subscribe to our newsletter for information about upcoming events, courses and news.'}</p>
        </div>
      </section>
    </div>
  );
}
