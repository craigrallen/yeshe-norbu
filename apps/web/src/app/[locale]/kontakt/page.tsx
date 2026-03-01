import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Kontakt' : 'Contact',
    description: sv
      ? 'Kontakta Yeshin Norbu Meditationscenter. Roslagsgatan 62, Stockholm. Telefon: 08-55 008 575.'
      : 'Contact Yeshin Norbu Meditation Centre. Roslagsgatan 62, Stockholm. Phone: 08-55 008 575.',
  };
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  return (
    <div className="pt-[72px]">
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal mb-6">{sv ? 'Kontakta oss' : 'Contact Us'}</h1>
        <div className="gold-bar mb-8" />
        <div className="prose prose-lg text-charcoal-light leading-relaxed whitespace-pre-line">
          {sv ? `Telefon: +46 (0)8 55 008 575
E-post: info@yeshinnorbu.se

Besöksadress: Roslagsgatan 62, Stockholm
Postadress: Birger Jarlsgatan 131B, 113 56 Stockholm` : `Phone: +46 (0)8 55 008 575
Email: info@yeshinnorbu.se

Visiting address: Roslagsgatan 62, Stockholm
Postal address: Birger Jarlsgatan 131B, 113 56 Stockholm`}
        </div>
        <div className="bg-white rounded-2xl border border-[#E8E4DE] p-8 mt-8">
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-6">{sv ? 'Skicka meddelande' : 'Send a message'}</h2>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input placeholder={sv ? 'Namn' : 'Name'} className="w-full border border-[#E8E4DE] rounded-xl px-4 py-3 text-sm" />
              <input placeholder="Email" type="email" className="w-full border border-[#E8E4DE] rounded-xl px-4 py-3 text-sm" />
            </div>
            <select className="w-full border border-[#E8E4DE] rounded-xl px-4 py-3 text-sm text-charcoal-light">
              <option>{sv ? 'Ämne' : 'Subject'}</option>
              <option>{sv ? 'Kurser' : 'Courses'}</option>
              <option>{sv ? 'Evenemang' : 'Events'}</option>
              <option>{sv ? 'Lokalhyra' : 'Room Booking'}</option>
              <option>{sv ? 'Centret' : 'Centre Information'}</option>
              <option>{sv ? 'Övrigt' : 'Other'}</option>
            </select>
            <textarea rows={5} placeholder={sv ? 'Meddelande' : 'Message'} className="w-full border border-[#E8E4DE] rounded-xl px-4 py-3 text-sm" />
            <button className="btn-gold">{sv ? 'Skicka' : 'Send'}</button>
          </form>
        </div>
      </section>
    </div>
  );
}
