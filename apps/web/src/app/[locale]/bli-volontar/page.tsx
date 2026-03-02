import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Bli volontär' : 'Volunteer',
    description: sv ? 'Hjälp till på Yeshin Norbu som volontär. Vi söker hjälp med reception, café, evenemang och mer.' : 'Help out at Yeshin Norbu as a volunteer. We need help with reception, café, events and more.',
  };
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  return (
    <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#1A1A1A]">
      <PageHero
        title={sv ? 'Bli volontär' : 'Volunteer'}
        subtitle={sv ? 'Bidra till en meningsfull gemenskap' : 'Contribute to a meaningful community'}
      />
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="prose prose-lg dark:prose-invert text-charcoal-light dark:text-[#C0BAB0] leading-relaxed whitespace-pre-line">
          {sv ? `Yeshin Norbu välkomnar alltid volontärer! Vi är en ideell organisation som drivs av engagerad personal och volontärer. Utan människor som vänligt erbjuder sin tid, kompetens och tjänst skulle vi inte kunna existera.

Att vara volontär på Yeshin Norbu är ett bra sätt att bli en del av en gemenskap och bidra till ett meningsfullt arbete.

Kontakta oss på info@yeshinnorbu.se om du vill veta mer.` : `Yeshin Norbu always welcomes volunteers! We are a non-profit organisation run by dedicated staff and volunteers. Without people kindly offering their time, skills and service, we would not be able to exist.

Volunteering at Yeshin Norbu is a great way to become part of a community and contribute to meaningful work.

Contact us at info@yeshinnorbu.se to learn more.`}
        </div>
      </section>
    </div>
  );
}
