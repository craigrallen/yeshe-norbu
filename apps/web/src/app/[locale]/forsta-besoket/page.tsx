import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Ditt första besök' : 'Your First Visit',
    description: sv
      ? 'Välkommen till Yeshin Norbu! Allt du behöver veta inför ditt första besök — vad du kan förvänta dig, var vi finns och hur du hittar.'
      : 'Welcome to Yeshin Norbu! Everything you need to know before your first visit — what to expect, where to find us and how to get here.',
  };
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  return (
    <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#1A1A1A]">
      <PageHero
        title={sv ? 'Ditt första besök' : 'Your First Visit'}
        subtitle={sv ? 'Välkommen till Yeshin Norbu' : 'Welcome to Yeshin Norbu'}
      />
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="prose prose-lg dark:prose-invert text-charcoal-light dark:text-[#C0BAB0] leading-relaxed whitespace-pre-line">
          {sv ? `Välkommen till Yeshin Norbu! Här på centret eller för en klass eller ett event, vad bör du tänka på?

Visa din biljett för den person som tar emot dig och gå med i klassen. Om du är tidig, ta en kopp te eller kaffe i vårt café och koppla av. Om du är sen, ring på dörrklockan så öppnar vi.

Vill du bara titta förbi och se vad vi erbjuder? Vårt café är öppet för alla!` : `Welcome to Yeshin Norbu! Here for a class or event, what should you think about?

Show your ticket to the person receiving you and join the class. If you're early, have a cup of tea or coffee in our café and relax. If you're late, press the doorbell and we will open the door for you.

Just want to drop by and check us out? Our café is open for everyone!`}
        </div>
      </section>
    </div>
  );
}
