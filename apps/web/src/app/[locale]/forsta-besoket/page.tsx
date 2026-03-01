import type { Metadata } from 'next';

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
    <div className="pt-[72px]">
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal mb-6">{sv ? 'Ditt första besök' : 'Your First Visit'}</h1>
        <div className="gold-bar mb-8" />
        <div className="prose prose-lg text-charcoal-light leading-relaxed whitespace-pre-line">
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
