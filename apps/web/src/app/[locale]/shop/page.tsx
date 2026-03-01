import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Butik' : 'Shop',
    description: sv ? 'Handla böcker, meditationskuddar och tillbehör från Yeshin Norbu.' : 'Shop books, meditation cushions and accessories from Yeshin Norbu.',
  };
}

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function ShopPage({ params: { locale }, searchParams }: { params: { locale: string }; searchParams: { cat?: string } }) {
  const sv = locale === 'sv';
  const catFilter = searchParams.cat || '';

  let query = `SELECT id, slug, name_sv, name_en, price_sek, regular_price_sek, sale_price_sek, 
               featured_image_url, categories, product_type, stock_status
               FROM products WHERE published = true`;
  const params: any[] = [];

  if (catFilter) {
    params.push(`%${catFilter}%`);
    query += ` AND categories::text ILIKE $${params.length}`;
  }

  query += ' ORDER BY name_sv LIMIT 100';
  const { rows } = await pool.query(query, params);

  // Get unique categories
  const { rows: allProds } = await pool.query("SELECT DISTINCT jsonb_array_elements_text(categories) as cat FROM products WHERE published = true ORDER BY cat");
  const cats = allProds.map((r: any) => r.cat).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#1A1A1A]">
      <div className="bg-[#58595b] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{sv ? 'Butik' : 'Shop'}</h1>
          <p className="text-lg text-gray-300">{sv ? 'Böcker, kursmaterial och tillbehör' : 'Books, course materials and accessories'}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <a href={`/${locale}/shop`} className={"px-3 py-1.5 rounded-full text-sm border " + (!catFilter ? 'bg-[#58595b] text-white' : 'bg-white text-gray-700 border-gray-200')}>
            {sv ? 'Alla' : 'All'}
          </a>
          {cats.map((c: string) => (
            <a key={c} href={`/${locale}/shop?cat=${encodeURIComponent(c)}`}
               className={"px-3 py-1.5 rounded-full text-sm border " + (catFilter === c ? 'bg-[#58595b] text-white' : 'bg-white text-gray-700 border-gray-200')}>
              {c}
            </a>
          ))}
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rows.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
              {p.featured_image_url ? (
                <img src={p.featured_image_url} alt={sv ? p.name_sv : p.name_en} className="w-full h-48 object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-300 text-4xl"></div>
              )}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{sv ? p.name_sv : p.name_en}</h3>
                <div className="flex items-center justify-between">
                  {p.sale_price_sek ? (
                    <div>
                      <span className="line-through text-gray-400 text-sm">{Math.round(Number(p.regular_price_sek || p.price_sek))} kr</span>
                      <span className="text-red-600 font-bold ml-2">{Math.round(Number(p.sale_price_sek))} kr</span>
                    </div>
                  ) : (
                    <span className="font-bold text-gray-900">{Number(p.price_sek) > 0 ? `${Math.round(Number(p.price_sek))} kr` : (sv ? 'Gratis' : 'Free')}</span>
                  )}
                  {p.stock_status === 'outofstock' && <span className="text-xs text-red-600">{sv ? 'Slut' : 'Sold out'}</span>}
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="col-span-4 text-center text-gray-400 py-12">{sv ? 'Inga produkter' : 'No products'}</p>}
        </div>
      </div>
    </div>
  );
}
