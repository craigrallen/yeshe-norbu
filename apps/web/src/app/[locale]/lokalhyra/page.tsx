import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Lokalhyra' : 'Venue Hire',
    description: sv ? 'Hyr lokaler på Yeshin Norbu för retreats, workshops, yoga eller andra evenemang i centrala Stockholm.' : 'Hire spaces at Yeshin Norbu for retreats, workshops, yoga or other events in central Stockholm.',
  };
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  return (
    <div className="pt-[72px]">
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal mb-6">{sv ? 'Lokalhyra' : 'Venue Hire'}</h1>
        <div className="gold-bar mb-8" />
        <div className="prose prose-lg text-charcoal-light leading-relaxed whitespace-pre-line">
          {sv ? `Hyr våra rymliga, ljusa, moderna lokaler med unik karaktär — belägen i en historisk byggnad från 1907. Vi befinner oss vid Roslagstull i närheten av KTH, Stockholms universitet och Karolinska institutet.

Vi har flera olika rum, alla med sin unika atmosfär. Våra lokaler är lämpliga för workshops, seminarier, retreats, yogaklasser och andra evenemang.

Kontakta oss på info@yeshinnorbu.se för bokning och priser.` : `Hire our spacious, bright, modern premises with unique character — located in a historic building from 1907. We are at Roslagstull, close to KTH, Stockholm University and Karolinska Institute.

We have several rooms, each with its own unique atmosphere. Our premises are suitable for workshops, seminars, retreats, yoga classes and other events.

Contact us at info@yeshinnorbu.se for booking and prices.`}
        </div>
      </section>
    </div>
  );
}
