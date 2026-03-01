export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  return (
    <div className="pt-[72px]">
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal mb-6">{sv ? 'Bli volontär' : 'Volunteer'}</h1>
        <div className="gold-bar mb-8" />
        <div className="prose prose-lg text-charcoal-light leading-relaxed whitespace-pre-line">
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
