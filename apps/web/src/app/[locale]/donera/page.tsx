import { getTranslations } from 'next-intl/server';

export default async function DonatePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'donate' });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-4">{t('title')}</h1>
      <p className="text-base text-muted mb-8">{t('description')}</p>

      {/* Donation widget - client component */}
      <DonationForm locale={locale as 'sv' | 'en'} />
    </div>
  );
}

function DonationForm({ locale }: { locale: 'sv' | 'en' }) {
  const amounts = [100, 250, 500, 1000];
  const s = locale === 'sv'
    ? { oneTime: 'Engångsgåva', monthly: 'Månadsgivare', custom: 'Annat belopp', card: 'Betala med kort', swish: 'Betala med Swish', dedication: 'Tillägnan (valfritt)', anonymous: 'Donera anonymt' }
    : { oneTime: 'One-time', monthly: 'Monthly', custom: 'Other amount', card: 'Pay by card', swish: 'Pay with Swish', dedication: 'Dedication (optional)', anonymous: 'Donate anonymously' };

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button className="flex-1 py-3 text-sm font-medium bg-brand text-white">{s.oneTime}</button>
        <button className="flex-1 py-3 text-sm font-medium bg-surface text-primary hover:bg-gray-50">{s.monthly}</button>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-3">
        {amounts.map((a) => (
          <button
            key={a}
            className="rounded-lg border border-border py-4 text-sm font-medium text-primary hover:border-brand/50 transition-colors"
          >
            {a} kr
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div>
        <input
          type="number"
          placeholder={s.custom}
          min={1}
          className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Dedication */}
      <div>
        <textarea
          placeholder={s.dedication}
          rows={3}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Anonymous */}
      <label className="flex items-center gap-2 text-sm text-primary">
        <input type="checkbox" className="rounded border-border" />
        {s.anonymous}
      </label>

      {/* Payment buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button className="h-12 rounded-lg bg-secondary text-white font-medium hover:bg-secondary-dark transition-colors">
          {s.card}
        </button>
        <button className="h-12 rounded-lg bg-[#009FE3] text-white font-medium hover:bg-[#0088C6] transition-colors">
          {s.swish}
        </button>
      </div>
    </div>
  );
}
