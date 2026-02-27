import { getTranslations } from 'next-intl/server';

export default async function MembershipPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'membership' });

  // TODO: Fetch plans from database
  const plans = [
    {
      name: locale === 'sv' ? 'Vän — Årsmedlemskap' : 'Friend — Annual',
      price: '300',
      interval: locale === 'sv' ? 'år' : 'year',
      description: locale === 'sv' ? 'Stöd Yeshe Norbu som vän.' : 'Support Yeshe Norbu as a friend.',
      features: locale === 'sv'
        ? ['Medlemsevenemang', 'Nyhetsbrev', '10% rabatt på kurser']
        : ['Member events', 'Newsletter', '10% course discount'],
    },
    {
      name: locale === 'sv' ? 'Ideell — Årsmedlemskap' : 'Non-Profit — Yearly',
      price: '500',
      interval: locale === 'sv' ? 'år' : 'year',
      description: locale === 'sv' ? 'Fullständigt medlemskap med rösträtt.' : 'Full membership with voting rights.',
      features: locale === 'sv'
        ? ['Rösträtt', 'Alla medlemsevenemang', '20% rabatt på kurser', 'Digitalt medlemskort']
        : ['Voting rights', 'All member events', '20% course discount', 'Digital membership card'],
      highlighted: true,
    },
    {
      name: locale === 'sv' ? 'Mental Gym — Månad' : 'Mental Gym — Monthly',
      price: '395',
      interval: locale === 'sv' ? 'mån' : 'month',
      description: locale === 'sv' ? 'Obegränsad tillgång till sessioner.' : 'Unlimited access to sessions.',
      features: locale === 'sv'
        ? ['Obegränsade sessioner', 'Onlinekurser', 'Personlig uppföljning', 'Mental Gym-community']
        : ['Unlimited sessions', 'Online courses', 'Personal follow-up', 'Mental Gym community'],
    },
  ];

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-primary mb-4">{t('title')}</h1>
        <p className="text-base text-muted max-w-xl mx-auto">{t('description')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg border bg-surface p-6 flex flex-col ${
              plan.highlighted ? 'border-brand ring-2 ring-brand/20' : 'border-border'
            }`}
          >
            <h3 className="text-lg font-semibold text-primary mb-1">{plan.name}</h3>
            <p className="text-sm text-muted mb-4">{plan.description}</p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-primary">{plan.price}</span>
              <span className="text-sm text-muted ml-1">kr / {plan.interval}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-primary">
                  <svg className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`w-full h-10 rounded-lg font-medium text-sm transition-colors ${
                plan.highlighted
                  ? 'bg-brand text-white hover:bg-brand-dark'
                  : 'border border-border text-primary hover:bg-gray-50'
              }`}
            >
              {t('signUp')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
