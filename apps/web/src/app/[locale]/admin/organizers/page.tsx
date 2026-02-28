import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/authz';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createOrganizer(formData: FormData) {
  'use server';
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const url = String(formData.get('url') || '').trim();
  if (!name) return;
  const slug = name.toLowerCase().replace(/[^a-z0-9åäö]+/g,'-').replace(/å/g,'a').replace(/ä/g,'a').replace(/ö/g,'o').slice(0,120);
  const p = new Pool({ connectionString: process.env.DATABASE_URL });
  await p.query('INSERT INTO organizers (slug, name, email, phone, url) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (slug) DO NOTHING',
    [slug, name, email, phone, url]);
  revalidatePath('/sv/admin/organizers');
  revalidatePath('/en/admin/organizers');
}

export default async function AdminOrganizers({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);
  const { rows } = await pool.query('SELECT * FROM organizers ORDER BY name');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{sv ? 'Arrangörer' : 'Organizers'}</h1>
      <p className="text-gray-500 text-sm">{rows.length} {sv ? 'arrangörer' : 'organizers'}</p>

      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold mb-3">{sv ? 'Lägg till arrangör' : 'Add organizer'}</h2>
        <form action={createOrganizer} className="grid md:grid-cols-4 gap-3">
          <input name="name" required placeholder={sv ? 'Namn' : 'Name'} className="border rounded-lg px-3 py-2" />
          <input name="email" type="email" placeholder="Email" className="border rounded-lg px-3 py-2" />
          <input name="phone" placeholder={sv ? 'Telefon' : 'Phone'} className="border rounded-lg px-3 py-2" />
          <button className="px-4 py-2 bg-[#58595b] text-white rounded-lg font-medium">+ {sv ? 'Lägg till' : 'Add'}</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{sv ? 'Namn' : 'Name'}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{sv ? 'Telefon' : 'Phone'}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">URL</th>
          </tr></thead>
          <tbody className="divide-y">
            {rows.map((o: any) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{o.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{o.email || '\u2014'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{o.phone || '\u2014'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{o.url ? <a href={o.url} className="text-blue-600 hover:underline">{o.url}</a> : '\u2014'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
