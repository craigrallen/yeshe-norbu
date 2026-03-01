import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Bli medlem' : 'Become a Member',
    description: sv
      ? 'Bli medlem i Yeshin Norbu och få rabatter på kurser, nyhetsbrev och möjlighet att påverka centrets framtid.'
      : 'Join Yeshin Norbu for course discounts, newsletters and a voice in the centre\'s future.',
  };
}

export default async function BliMedlemPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isSv = locale === 'sv';

  // Real membership tiers from WP PMPro (levels 11-15)
  const tiers = [
    {
      id: 11,
      slug: 'non-profit',
      name: isSv ? 'Icke-vinstdrivande' : 'Non-Profit',
      description: isSv
        ? 'För ideella organisationer och studenter. Ger tillgång till alla vanliga evenemang och undervisningar.'
        : 'For non-profits and students. Access to all regular events and teachings.',
      priceSek: 250,
      period: isSv ? 'per år' : 'per year',
      type: 'subscription',
      interval: 'year',
      features: [
        isSv ? 'Rabatterade evenemangsavgifter' : 'Discounted event fees',
        isSv ? 'Tillgång till studiecirklar' : 'Access to study groups',
        isSv ? 'Digitalt nyhetsbrev' : 'Digital newsletter',
      ],
      highlight: false,
    },
    {
      id: 12,
      slug: 'gym-card',
      name: isSv ? 'Mentalgym Månadsvis' : 'Mental Gym Monthly',
      description: isSv
        ? 'Flexibelt månadsmedlemskap med full tillgång till alla program och retreatter.'
        : 'Flexible monthly membership with full access to all programs and retreats.',
      priceSek: 950,
      period: isSv ? 'per månad' : 'per month',
      type: 'subscription',
      interval: 'month',
      features: [
        isSv ? 'Obegränsat antal evenemang' : 'Unlimited events',
        isSv ? 'Retreattrabatt 20%' : '20% retreat discount',
        isSv ? 'Online-undervisning' : 'Online teachings',
        isSv ? 'Prioritet vid bokning' : 'Priority booking',
      ],
      highlight: true,
    },
    {
      id: 13,
      slug: 'friend',
      name: isSv ? 'Mentalgym Årsvis' : 'Mental Gym Annual',
      description: isSv
        ? 'Spara 2 månader med årsmedlemskap. Bästa värdet för regelbundna praktiserande.'
        : 'Save 2 months with annual membership. Best value for regular practitioners.',
      priceSek: 9500,
      period: isSv ? 'per år' : 'per year',
      type: 'subscription',
      interval: 'year',
      features: [
        isSv ? 'Allt i månadsplan' : 'Everything in monthly',
        isSv ? 'Spara 11 400 kr/år vs månadsvis' : 'Save vs monthly plan',
        isSv ? 'Retreattrabatt 30%' : '30% retreat discount',
        isSv ? 'Personlig välkomstsamtal' : 'Personal welcome call',
      ],
      highlight: false,
    },
    {
      id: 15,
      slug: 'teacher',
      name: isSv ? 'Väktare' : 'Guardian',
      description: isSv
        ? 'Hedersmedlemskap för Dharma-lärare och regelbundna stödjare av centret.'
        : 'Honorary membership for Dharma teachers and regular center supporters.',
      priceSek: 0,
      period: isSv ? 'gratis' : 'free',
      type: 'payment',
      interval: null,
      features: [
        isSv ? 'Full tillgång till alla program' : 'Full access to all programs',
        isSv ? 'Inbjudan till exklusiva evenemang' : 'Invitation to exclusive events',
        isSv ? 'Erkänns i centrets publikationer' : 'Recognized in center publications',
      ],
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      {/* Hero */}
      <div className="bg-[#58595b] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isSv ? 'Bli Medlem' : 'Membership'}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {isSv
              ? 'Stöd Yeshin Norbu och fördjupa din praksis med ett av våra medlemskap.'
              : 'Support Yeshin Norbu and deepen your practice with one of our memberships.'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-16 max-w-lg mx-auto text-center">
          <div>
            <p className="text-3xl font-bold text-[#f5ca00]">56</p>
            <p className="text-sm text-gray-500">{isSv ? 'Aktiva medlemmar' : 'Active members'}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#f5ca00]">215</p>
            <p className="text-sm text-gray-500">{isSv ? 'Evenemang totalt' : 'Events total'}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#f5ca00]">2004</p>
            <p className="text-sm text-gray-500">{isSv ? 'Grundat' : 'Founded'}</p>
          </div>
        </div>

        {/* Membership cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {tiers.map(tier => (
            <div
              key={tier.id}
              className={`rounded-2xl border-2 p-6 flex flex-col transition-shadow hover:shadow-md ${
                tier.highlight
                  ? 'border-[#f5ca00] bg-[#FFF9EE] shadow-lg relative'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f5ca00] text-white text-xs font-bold px-3 py-1 rounded-full">
                  {isSv ? 'Populärast' : 'Most popular'}
                </div>
              )}

              <h2 className="font-bold text-[#58595b] text-lg mb-2">{tier.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{tier.description}</p>

              <div className="mb-6">
                {tier.priceSek === 0 ? (
                  <p className="text-3xl font-bold text-[#58595b]">{isSv ? 'Gratis' : 'Free'}</p>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-[#58595b]">{tier.priceSek.toLocaleString('sv-SE')}</span>
                    <span className="text-gray-400 ml-1 text-sm">kr/{tier.period}</span>
                  </>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#f5ca00] mt-0.5">•</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={
                  tier.priceSek === 0
                    ? `mailto:info@yeshinnorbu.se?subject=${encodeURIComponent('Väktarmedlemskap')}`
                    : `/api/subscriptions/checkout?plan=${tier.slug}&locale=${locale}`
                }
                className={`block text-center font-semibold py-3 rounded-xl transition-colors ${
                  tier.highlight
                    ? 'bg-[#f5ca00] text-white hover:bg-[#d4af00]'
                    : 'bg-[#58595b] text-white hover:bg-[#6b6c6e]'
                }`}
              >
                {tier.priceSek === 0
                  ? (isSv ? 'Kontakta oss' : 'Contact us')
                  : (isSv ? 'Välj detta' : 'Choose this')}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#58595b] mb-8 text-center">
            {isSv ? 'Vanliga frågor' : 'FAQ'}
          </h2>
          <div className="space-y-4">
            {[
              {
                q: isSv ? 'Kan jag avsluta mitt medlemskap när som helst?' : 'Can I cancel anytime?',
                a: isSv ? 'Ja, månadsmedlemskap kan avslutas närsomhelst. Årsmedlemskap gäller hela perioden.' : 'Yes, monthly memberships can be cancelled anytime. Annual memberships run for the full year.',
              },
              {
                q: isSv ? 'Vilka betalningsmetoder accepteras?' : 'What payment methods are accepted?',
                a: isSv ? 'Vi accepterar Swish, Visa och Mastercard (inklusive Apple Pay och Google Pay).' : 'We accept Swish, Visa and Mastercard (including Apple Pay and Google Pay).',
              },
              {
                q: isSv ? 'Är centret FPMT-anslutet?' : 'Is the center FPMT-affiliated?',
                a: isSv ? 'Ja, Yeshin Norbu är ett FPMT-center (Foundation for the Preservation of the Mahayana Tradition).' : 'Yes, Yeshin Norbu is an FPMT center (Foundation for the Preservation of the Mahayana Tradition).',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-[#58595b] mb-2">{item.q}</h3>
                <p className="text-gray-500 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
