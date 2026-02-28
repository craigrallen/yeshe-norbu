import { Pool } from 'pg';
import { requireAdmin } from '@/lib/authz';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function AdminProducts({ params: { locale }, searchParams }: { params: { locale: string }; searchParams: { type?: string; q?: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);

  let query = 'SELECT id, slug, name_sv, name_en, price_sek, regular_price_sek, sale_price_sek, sku, stock_status, product_type, published, featured, featured_image_url FROM products';
  const params: any[] = [];
  const conditions: string[] = [];

  if (searchParams.type) {
    params.push(searchParams.type);
    conditions.push(`product_type = $${params.length}`);
  }
  if (searchParams.q) {
    params.push(`%${searchParams.q}%`);
    conditions.push(`(name_sv ILIKE $${params.length} OR name_en ILIKE $${params.length} OR sku ILIKE $${params.length})`);
  }

  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY name_sv LIMIT 200';

  const { rows } = await pool.query(query, params);
  const { rows: [{ count }] } = await pool.query('SELECT count(*)::int FROM products');
  const { rows: types } = await pool.query("SELECT product_type, count(*)::int as c FROM products GROUP BY product_type ORDER BY c DESC");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{sv ? 'Produkter' : 'Products'}</h1>
          <p className="text-gray-500 text-sm">{count} {sv ? 'produkter totalt' : 'total products'}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <a href={`/${locale}/admin/products`} className={"px-3 py-1.5 rounded-full text-sm border " + (!searchParams.type ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border-gray-200')}>
          {sv ? 'Alla' : 'All'} ({count})
        </a>
        {types.map((t: any) => (
          <a key={t.product_type} href={`/${locale}/admin/products?type=${t.product_type}`}
             className={"px-3 py-1.5 rounded-full text-sm border " + (searchParams.type === t.product_type ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border-gray-200')}>
            {t.product_type} ({t.c})
          </a>
        ))}
        <form className="ml-auto">
          <input name="q" defaultValue={searchParams.q || ''} placeholder={sv ? 'Sök produkt...' : 'Search product...'} className="border rounded-lg px-3 py-1.5 text-sm w-64" />
        </form>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Produkt' : 'Product'}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Pris' : 'Price'}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Typ' : 'Type'}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {rows.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {p.featured_image_url ? <img src={p.featured_image_url} alt="" className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-gray-100 rounded" />}
                </td>
                <td className="px-4 py-3 text-sm">
                  <p className="font-medium text-gray-900"><a href={`/${locale}/admin/products/${p.id}`} className="text-blue-600 hover:underline">{sv ? p.name_sv : p.name_en}</a></p>
                  <p className="text-xs text-gray-400">/{p.slug}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.sku || '\u2014'}</td>
                <td className="px-4 py-3 text-sm">
                  {p.sale_price_sek ? (
                    <><span className="line-through text-gray-400">{Math.round(Number(p.regular_price_sek || p.price_sek))} kr</span> <span className="text-red-600 font-medium">{Math.round(Number(p.sale_price_sek))} kr</span></>
                  ) : (
                    <span>{Math.round(Number(p.price_sek))} kr</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{p.product_type}</td>
                <td className="px-4 py-3">
                  <span className={"px-2 py-0.5 text-xs rounded-full " + (p.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}>
                    {p.published ? (sv ? 'Publicerad' : 'Published') : (sv ? 'Utkast' : 'Draft')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
