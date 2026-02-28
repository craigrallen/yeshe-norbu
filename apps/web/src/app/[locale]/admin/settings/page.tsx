import { requireAdmin } from '@/lib/authz';
import { getStripeConfig } from '@/lib/stripe-config';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function saveStripe(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'sv');
  await requireAdmin(locale);

  const pk = String(formData.get('publishableKey') || '').trim();
  const sk = String(formData.get('secretKey') || '').trim();
  const wh = String(formData.get('webhookSecret') || '').trim();

  const upsert = async (key: string, value: string) => {
    await pool.query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, to_jsonb($2::text), now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [key, value]
    );
  };

  await upsert('stripe.publishable_key', pk);
  await upsert('stripe.secret_key', sk);
  await upsert('stripe.webhook_secret', wh);

  revalidatePath(`/${locale}/admin/settings`);
}

export default async function AdminSettingsPage({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);

  const stripe = await getStripeConfig();

  const mask = (value: string) => {
    if (!value) return '—';
    if (value.length <= 8) return '••••••••';
    return `${value.slice(0, 6)}••••••••${value.slice(-4)}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{sv ? 'Inställningar' : 'Settings'}</h1>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Stripe</h2>

        <form action={saveStripe} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Publishable key</div>
              <input name="publishableKey" defaultValue={stripe.publishableKey} className="font-mono w-full bg-gray-50 border rounded px-3 py-2" />
              <div className="text-xs text-gray-400 mt-1">{mask(stripe.publishableKey)}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Secret key</div>
              <input name="secretKey" defaultValue={stripe.secretKey} className="font-mono w-full bg-gray-50 border rounded px-3 py-2" />
              <div className="text-xs text-gray-400 mt-1">{mask(stripe.secretKey)}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Webhook secret</div>
              <input name="webhookSecret" defaultValue={stripe.webhookSecret} className="font-mono w-full bg-gray-50 border rounded px-3 py-2" />
              <div className="text-xs text-gray-400 mt-1">{mask(stripe.webhookSecret)}</div>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900">
            {sv
              ? 'Stripe-inställningar kan nu redigeras här av administratörer. Dessa värden används av checkout och webhook-rutter.'
              : 'Stripe settings are now editable here by administrators. These values are used by checkout and webhook routes.'}
          </div>

          <button className="px-4 py-2 rounded-lg bg-[#58595b] text-white">{sv ? 'Spara Stripe-inställningar' : 'Save Stripe settings'}</button>
        </form>

        <div className="flex gap-3 flex-wrap pt-2">
          <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg border">Stripe Dashboard</a>
        </div>
      </div>
    </div>
  );
}
