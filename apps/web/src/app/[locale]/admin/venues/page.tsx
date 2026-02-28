import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/authz';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createVenue(formData: FormData) {
  'use server';
  const name = String(formData.get('name') || '').trim();
  const address = String(formData.get('address') || '').trim();
  const city = String(formData.get('city') || '').trim();
  const country = String(formData.get('country') || 'Sweden').trim();
  const phone = String(formData.get('phone') || '').trim();
  if (!name) return;
  const slug = name.toLowerCase().replace(/[^a-z0-9åäö]+/g,'-').replace(/å/g,'a').replace(/ä/g,'a').replace(/ö/g,'o').slice(0,120);
  const p = new Pool({ connectionString: process.env.DATABASE_URL });
  await p.query('INSERT INTO venues (slug, name, address, city, country, phone) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO NOTHING',
    [slug, name, address, city, country, phone]);
  revalidatePath('/sv/admin/venues');
  revalidatePath('/en/admin/venues');
}

async function deleteVenue(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const p = new Pool({ connectionString: process.env.DATABASE_URL });
  await p.query('DELETE FROM venues WHERE id = $1', [id]);
  revalidatePath('/sv/admin/venues');
  revalidatePath('/en/admin/venues');
}

export default async function AdminVenues({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);
  const { rows } = await pool.query('SELECT * FROM venues ORDER BY name');
  const { rows: [{ count }] } = await pool.query('SELECT count(*)::int FROM venues');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{sv ? 'Platser / Venues' : 'Venues'}</h1>
      <p className="text-gray-500 text-sm">{count} {sv ? 'platser' : 'venues'}</p>

      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold mb-3">{sv ? 'Lägg till plats' : 'Add venue'}</h2>
        <form action={createVenue} className="grid md:grid-cols-5 gap-3">
          <input name="name" required placeholder={sv ? 'Namn' : 'Name'} className="border rounded-lg px-3 py-2" />
          <input name="address" placeholder={sv ? 'Adress' : 'Address'} className="border rounded-lg px-3 py-2" />
          <input name="city" placeholder={sv ? 'Stad' : 'City'} className="border rounded-lg px-3 py-2" />
          <input name="country" defaultValue="Sweden" placeholder={sv ? 'Land' : 'Country'} className="border rounded-lg px-3 py-2" />
          <button className="px-4 py-2 bg-[#58595b] text-white rounded-lg font-medium">+ {sv ? 'Lägg till' : 'Add'}</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{sv ? 'Namn' : 'Name'}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{sv ? 'Adress' : 'Address'}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{sv ? 'Stad' : 'City'}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{sv ? 'Telefon' : 'Phone'}</th>
            <th className="px-6 py-3"></th>
          </tr></thead>
          <tbody className="divide-y">
            {rows.map((v: any) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{v.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{v.address || '\u2014'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{v.city || '\u2014'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{v.phone || '\u2014'}</td>
                <td className="px-6 py-4 text-right">
                  <form action={deleteVenue}><input type="hidden" name="id" value={v.id} />
                    <button className="text-red-600 hover:text-red-800 text-sm">{sv ? 'Ta bort' : 'Delete'}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
