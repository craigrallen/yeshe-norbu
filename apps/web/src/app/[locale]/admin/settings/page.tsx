import { requireAdmin } from '@/lib/authz';
import { getStripeConfig } from '@/lib/stripe-config';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getSetting(key: string): Promise<string> {
  try {
    const { rows } = await pool.query(`SELECT value FROM app_settings WHERE key = $1`, [key]);
    if (!rows.length) return '';
    const v = rows[0].value;
    return typeof v === 'string' ? v : JSON.stringify(v);
  } catch { return ''; }
}

async function upsert(key: string, value: string) {
  await pool.query(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES ($1, to_jsonb($2::text), now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, value]
  );
}

async function upsertJson(key: string, value: object) {
  await pool.query(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  );
}

async function saveStripe(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'sv');
  await requireAdmin(locale);
  const pk = String(formData.get('publishableKey') || '').trim();
  const sk = String(formData.get('secretKey') || '').trim();
  const wh = String(formData.get('webhookSecret') || '').trim();
  await upsert('stripe.publishable_key', pk);
  await upsert('stripe.secret_key', sk);
  await upsert('stripe.webhook_secret', wh);
  revalidatePath(`/${locale}/admin/settings`);
}

async function saveSite(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'sv');
  await requireAdmin(locale);
  await upsert('site.name', String(formData.get('siteName') || '').trim());
  await upsert('site.tagline', String(formData.get('tagline') || '').trim());
  await upsert('site.email', String(formData.get('email') || '').trim());
  await upsert('site.phone', String(formData.get('phone') || '').trim());
  await upsert('site.address', String(formData.get('address') || '').trim());
  revalidatePath(`/${locale}/admin/settings`);
}

async function saveSocial(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'sv');
  await requireAdmin(locale);
  await upsertJson('social', {
    facebook: String(formData.get('facebook') || '').trim(),
    instagram: String(formData.get('instagram') || '').trim(),
    youtube: String(formData.get('youtube') || '').trim(),
  });
  revalidatePath(`/${locale}/admin/settings`);
}

async function saveSeo(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'sv');
  await requireAdmin(locale);
  await upsert('seo.description', String(formData.get('description') || '').trim());
  await upsert('seo.og_image', String(formData.get('ogImage') || '').trim());
  await upsert('analytics.ga_id', String(formData.get('gaId') || '').trim());
  revalidatePath(`/${locale}/admin/settings`);
}

async function saveAnnouncement(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'sv');
  await requireAdmin(locale);
  await upsertJson('announcement', {
    text: String(formData.get('text') || '').trim(),
    enabled: formData.get('enabled') === 'on',
    color: String(formData.get('color') || '#E8B817').trim(),
  });
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/admin/settings`);
}

export default async function AdminSettingsPage({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);

  const stripe = await getStripeConfig();

  // Load site settings
  const [siteName, tagline, email, phone, address] = await Promise.all([
    getSetting('site.name'), getSetting('site.tagline'), getSetting('site.email'),
    getSetting('site.phone'), getSetting('site.address'),
  ]);

  let social = { facebook: '', instagram: '', youtube: '' };
  try {
    const raw = await getSetting('social');
    const parsed = raw ? JSON.parse(raw) : {};
    social = { ...social, ...parsed };
  } catch {}

  const [seoDesc, ogImage, gaId] = await Promise.all([
    getSetting('seo.description'), getSetting('seo.og_image'), getSetting('analytics.ga_id'),
  ]);

  let announcement = { text: '', enabled: false, color: '#E8B817' };
  try {
    const raw = await getSetting('announcement');
    const parsed = raw ? JSON.parse(raw) : {};
    announcement = { ...announcement, ...parsed };
  } catch {}

  const mask = (value: string) => {
    if (!value) return '—';
    if (value.length <= 8) return '••••••••';
    return `${value.slice(0, 6)}••••••••${value.slice(-4)}`;
  };

  const inputCls = 'w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const sectionCls = 'bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 space-y-4';
  const labelCls = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sv ? 'Inställningar' : 'Settings'}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{sv ? 'Webbplats- och systemkonfiguration' : 'Site and system configuration'}</p>
      </div>

      {/* Site Settings */}
      <div className={sectionCls}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{sv ? 'Webbplatsinställningar' : 'Site Settings'}</h2>
        <form action={saveSite} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{sv ? 'Webbplatsnamn' : 'Site name'}</label>
              <input name="siteName" defaultValue={siteName || 'Yeshin Norbu Meditationscenter'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{sv ? 'Slogan' : 'Tagline'}</label>
              <input name="tagline" defaultValue={tagline} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{sv ? 'Kontaktepost' : 'Contact email'}</label>
              <input name="email" type="email" defaultValue={email || 'info@yeshinnorbu.se'} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{sv ? 'Telefon' : 'Phone'}</label>
              <input name="phone" defaultValue={phone || '+46 (0)8 55 008 575'} className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>{sv ? 'Adress' : 'Address'}</label>
              <input name="address" defaultValue={address || 'Roslagsgatan 62, Stockholm'} className={inputCls} />
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-80">
            {sv ? 'Spara' : 'Save'}
          </button>
        </form>
      </div>

      {/* Social Media */}
      <div className={sectionCls}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{sv ? 'Sociala medier' : 'Social Media'}</h2>
        <form action={saveSocial} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Facebook URL</label>
              <input name="facebook" defaultValue={social.facebook} placeholder="https://facebook.com/..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Instagram URL</label>
              <input name="instagram" defaultValue={social.instagram} placeholder="https://instagram.com/..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>YouTube URL</label>
              <input name="youtube" defaultValue={social.youtube} placeholder="https://youtube.com/..." className={inputCls} />
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-80">
            {sv ? 'Spara' : 'Save'}
          </button>
        </form>
      </div>

      {/* SEO + Analytics */}
      <div className={sectionCls}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SEO & Analytics</h2>
        <form action={saveSeo} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div>
            <label className={labelCls}>{sv ? 'Standard metabeskrivning' : 'Default meta description'}</label>
            <textarea name="description" defaultValue={seoDesc} rows={3} className={inputCls + ' resize-none'} />
          </div>
          <div>
            <label className={labelCls}>OG Image URL</label>
            <input name="ogImage" defaultValue={ogImage || '/brand/church-01.jpg'} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Google Analytics ID</label>
            <input name="gaId" defaultValue={gaId} placeholder="G-XXXXXXXXXX" className={inputCls} />
          </div>
          <button className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-80">
            {sv ? 'Spara' : 'Save'}
          </button>
        </form>
      </div>

      {/* Announcement Banner */}
      <div className={sectionCls}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{sv ? 'Annonsbanderoll' : 'Announcement Banner'}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{sv ? 'Visas överst på alla publika sidor när aktiverad.' : 'Shown at the top of all public pages when enabled.'}</p>
        <form action={saveAnnouncement} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div>
            <label className={labelCls}>{sv ? 'Meddelandetext' : 'Message text'}</label>
            <input name="text" defaultValue={announcement.text} placeholder={sv ? 'T.ex. Välkommen till vår sommarretreat!' : 'E.g. Welcome to our summer retreat!'} className={inputCls} />
          </div>
          <div className="flex items-center gap-6">
            <div>
              <label className={labelCls}>{sv ? 'Bakgrundsfärg' : 'Background color'}</label>
              <input name="color" type="color" defaultValue={announcement.color || '#E8B817'} className="h-9 w-16 border dark:border-gray-600 rounded cursor-pointer" />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input name="enabled" type="checkbox" defaultChecked={announcement.enabled} id="ann-enabled" className="w-4 h-4 rounded" />
              <label htmlFor="ann-enabled" className="text-sm text-gray-700 dark:text-gray-200">{sv ? 'Aktivera banderoll' : 'Enable banner'}</label>
            </div>
          </div>
          {announcement.text && (
            <div className="rounded-lg p-3 text-sm font-medium text-center" style={{ backgroundColor: announcement.color || '#E8B817', color: '#1a1a1a' }}>
              {sv ? 'Förhandsgranskning: ' : 'Preview: '}{announcement.text}
            </div>
          )}
          <button className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-80">
            {sv ? 'Spara' : 'Save'}
          </button>
        </form>
      </div>

      {/* Stripe */}
      <div className={sectionCls}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stripe</h2>
        <form action={saveStripe} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Publishable key</label>
              <input name="publishableKey" defaultValue={stripe.publishableKey} className={inputCls + ' font-mono'} />
              <div className="text-xs text-gray-400 mt-1">{mask(stripe.publishableKey)}</div>
            </div>
            <div>
              <label className={labelCls}>Secret key</label>
              <input name="secretKey" defaultValue={stripe.secretKey} className={inputCls + ' font-mono'} />
              <div className="text-xs text-gray-400 mt-1">{mask(stripe.secretKey)}</div>
            </div>
            <div>
              <label className={labelCls}>Webhook secret</label>
              <input name="webhookSecret" defaultValue={stripe.webhookSecret} className={inputCls + ' font-mono'} />
              <div className="text-xs text-gray-400 mt-1">{mask(stripe.webhookSecret)}</div>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-80">
            {sv ? 'Spara Stripe-inställningar' : 'Save Stripe settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
