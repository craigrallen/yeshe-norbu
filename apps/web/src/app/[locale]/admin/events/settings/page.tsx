import { Pool } from 'pg';
import { requireAdmin } from '@/lib/authz';
import { revalidatePath } from 'next/cache';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function saveDefaults(formData: FormData) {
  'use server';
  await requireAdmin('sv');

  const categories = formData.getAll('defaultCategory').map(String);
  const plans = formData.getAll('planSlug').map(String);

  await pool.query(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES ('events.member_included_default_categories', $1::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [JSON.stringify(categories)]
  );

  await pool.query(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES ('events.member_included_plan_slugs', $1::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [JSON.stringify(plans)]
  );

  revalidatePath('/sv/admin/events');
  revalidatePath('/en/admin/events');
  revalidatePath('/sv/admin/events/settings');
  revalidatePath('/en/admin/events/settings');
}

async function applyDefaultsToExisting() {
  'use server';
  await requireAdmin('sv');
  const { rows } = await pool.query("SELECT value FROM app_settings WHERE key='events.member_included_default_categories' LIMIT 1");
  const slugs: string[] = rows?.[0]?.value || [];
  if (!slugs.length) return;

  await pool.query(
    `UPDATE events
     SET member_included = true
     WHERE category_id IN (SELECT id FROM event_categories WHERE slug = ANY($1::text[]))`,
    [slugs]
  );

  revalidatePath('/sv/admin/events');
  revalidatePath('/en/admin/events');
}

export default async function EventSettingsPage({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);

  const { rows: categories } = await pool.query('SELECT id, slug, name_sv, name_en FROM event_categories ORDER BY name_sv');
  const { rows: plans } = await pool.query('SELECT slug, name_sv, name_en FROM membership_plans WHERE active = true ORDER BY name_sv');

  const { rows: defaultRows } = await pool.query("SELECT value FROM app_settings WHERE key='events.member_included_default_categories' LIMIT 1");
  const { rows: planRows } = await pool.query("SELECT value FROM app_settings WHERE key='events.member_included_plan_slugs' LIMIT 1");

  const defaults: string[] = defaultRows?.[0]?.value || [];
  const eligiblePlans: string[] = planRows?.[0]?.value || [];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <a href={`/${locale}/admin/events`} className="text-sm text-blue-600 hover:underline">&larr; {sv ? 'Tillbaka till evenemang' : 'Back to events'}</a>
      <h1 className="text-2xl font-bold">{sv ? 'Eventinställningar' : 'Event Settings'}</h1>

      <form action={saveDefaults} className="bg-white rounded-xl border p-6 space-y-6">
        <div>
          <h2 className="font-semibold mb-2">{sv ? 'Kategorier som ska vara “gratis för medlemmar” som standard' : 'Categories that default to “free for members”'}</h2>
          <div className="space-y-2">
            {categories.map((c: any) => (
              <label key={c.slug} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="defaultCategory" value={c.slug} defaultChecked={defaults.includes(c.slug)} />
                <span>{sv ? c.name_sv : c.name_en} <span className="text-gray-400">({c.slug})</span></span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">{sv ? 'Medlemsplaner som ger gratis bokning' : 'Membership plans eligible for free booking'}</h2>
          <div className="space-y-2">
            {plans.map((p: any) => (
              <label key={p.slug} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="planSlug" value={p.slug} defaultChecked={eligiblePlans.includes(p.slug)} />
                <span>{sv ? p.name_sv : p.name_en} <span className="text-gray-400">({p.slug})</span></span>
              </label>
            ))}
          </div>
        </div>

        <button className="px-5 py-2 rounded-lg bg-[#58595b] text-white">{sv ? 'Spara inställningar' : 'Save settings'}</button>
      </form>

      <form action={applyDefaultsToExisting} className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-2">{sv ? 'Applicera på befintliga event' : 'Apply to existing events'}</h2>
        <p className="text-sm text-gray-500 mb-4">{sv ? 'Sätter “gratis för medlemmar” på alla event i valda standardkategorier.' : 'Sets “free for members” on all events in selected default categories.'}</p>
        <button className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700">{sv ? 'Applicera nu' : 'Apply now'}</button>
      </form>
    </div>
  );
}
