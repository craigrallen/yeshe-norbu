import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Stöd oss' : 'Support Us',
    description: sv ? 'Stöd Yeshin Norbu genom medlemskap, donationer eller volontärarbete.' : 'Support Yeshin Norbu through membership, donations or volunteering.',
  };
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <PageHero
        title={sv ? 'Stöd oss' : 'Support Us'}
        subtitle={sv ? 'Bli medlem, donera eller volontärarbeta.' : 'Become a member, donate or volunteer.'}
      />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <p className="text-lg text-charcoal-light leading-relaxed">
          {sv ? 'Det finns många sätt att stötta Yeshin Norbu Meditationscenter. Bli medlem, köp ett Mental Gym-kort, volontärarbeta eller donera.' : 'There are many ways to support Yeshin Norbu Meditation Centre. Become a member, buy a Mental Gym Card, volunteer or donate.'}
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <a href={`/${locale}/bli-medlem`} className="block rounded-2xl border border-[#E8E4DE] bg-white p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
            <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">{sv ? 'Bli medlem' : 'Become a Member'}</h3>
            <span className="text-brand-dark text-sm font-medium">{sv ? 'Läs mer →' : 'Read more →'}</span>
          </a>
          <a href={`/${locale}/donera`} className="block rounded-2xl border border-[#E8E4DE] bg-white p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
            <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">{sv ? 'Donera' : 'Donate'}</h3>
            <span className="text-brand-dark text-sm font-medium">{sv ? 'Läs mer →' : 'Read more →'}</span>
          </a>
          <a href={`/${locale}/bli-volontar`} className="block rounded-2xl border border-[#E8E4DE] bg-white p-6 hover:-translate-y-1 hover:shadow-lg transition-all">
            <h3 className="font-serif text-xl font-semibold text-charcoal mb-1">{sv ? 'Bli volontär' : 'Volunteer'}</h3>
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
