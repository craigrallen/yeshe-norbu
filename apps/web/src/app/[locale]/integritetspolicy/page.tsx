import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Integritetspolicy' : 'Privacy Policy',
    description: sv ? 'Yeshin Norbus integritetspolicy och hantering av personuppgifter enligt GDPR.' : 'Yeshin Norbu privacy policy and personal data handling under GDPR.',
  };
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  return (
    <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#1A1A1A]">
      <PageHero
        title={sv ? 'Integritetspolicy' : 'Privacy Policy'}
        subtitle={sv ? 'Hur vi hanterar dina personuppgifter' : 'How we handle your personal data'}
      />
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="prose prose-lg dark:prose-invert text-charcoal-light dark:text-[#C0BAB0] leading-relaxed whitespace-pre-line">
          {sv ? `Yeshin Norbu behöver följa den allmänna dataskyddsförordningen (GDPR), som gäller sedan den 25 maj 2018, när det gäller behandling av personuppgifter.

Yeshin Norbu åtar sig att behandla data som är adekvat, relevant och begränsad till vad som är nödvändigt i förhållande till de ändamål för vilka den behandlas.

För frågor om vår integritetspolicy, kontakta oss på info@yeshinnorbu.se.` : `Yeshin Norbu needs to comply with the General Data Protection Regulation (GDPR), effective since May 25th 2018, regarding the processing of personal data.

Yeshin Norbu is committed to processing data that is adequate, relevant and limited to what is necessary in relation to the purposes for which it is processed.

For questions about our privacy policy, contact us at info@yeshinnorbu.se.`}
        </div>
      </section>
    </div>
  );
}
