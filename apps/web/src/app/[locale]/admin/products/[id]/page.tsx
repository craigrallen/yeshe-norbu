import { Pool } from 'pg';
import { requireAdmin } from '@/lib/authz';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function csvToJsonArray(input: string) {
  return JSON.stringify(input.split(',').map(s => s.trim()).filter(Boolean));
}

async function updateProduct(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  const locale = String(formData.get('locale') || 'sv');

  const nameSv = String(formData.get('nameSv') || '').trim();
  const nameEn = String(formData.get('nameEn') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  const sku = String(formData.get('sku') || '').trim();
  const productType = String(formData.get('productType') || 'simple').trim();
  const stockStatus = String(formData.get('stockStatus') || 'instock').trim();
  const stockQuantity = String(formData.get('stockQuantity') || '').trim();

  const priceSek = Number(formData.get('priceSek') || 0) || 0;
  const regularPriceSek = Number(formData.get('regularPriceSek') || 0) || null;
  const salePriceSek = Number(formData.get('salePriceSek') || 0) || null;

  const descSv = String(formData.get('descriptionSv') || '');
  const descEn = String(formData.get('descriptionEn') || '');
  const shortSv = String(formData.get('shortDescriptionSv') || '');
  const shortEn = String(formData.get('shortDescriptionEn') || '');

  const categories = csvToJsonArray(String(formData.get('categoriesCsv') || ''));
  const tags = csvToJsonArray(String(formData.get('tagsCsv') || ''));

  const featuredImageUrl = String(formData.get('featuredImageUrl') || '').trim() || null;

  const published = formData.get('published') === 'on';
  const featured = formData.get('featured') === 'on';
  const downloadable = formData.get('downloadable') === 'on';
  const virtualProduct = formData.get('virtualProduct') === 'on';

  await pool.query(
    `UPDATE products
     SET slug = $1,
         name_sv = $2,
         name_en = $3,
         description_sv = $4,
         description_en = $5,
         short_description_sv = $6,
         short_description_en = $7,
         price_sek = $8,
         regular_price_sek = $9,
         sale_price_sek = $10,
         sku = $11,
         stock_quantity = $12,
         stock_status = $13,
         product_type = $14,
         featured_image_url = $15,
         published = $16,
         featured = $17,
         downloadable = $18,
         virtual_product = $19,
         categories = $20::jsonb,
         tags = $21::jsonb,
         updated_at = now()
     WHERE id = $22`,
    [
      slug,
      nameSv,
      nameEn || nameSv,
      descSv,
      descEn || descSv,
      shortSv,
      shortEn || shortSv,
      priceSek,
      regularPriceSek,
      salePriceSek,
      sku || null,
      stockQuantity ? Number(stockQuantity) : null,
      stockStatus,
      productType,
      featuredImageUrl,
      published,
      featured,
      downloadable,
      virtualProduct,
      categories,
      tags,
      id,
    ]
  );

  revalidatePath(`/${locale}/admin/products`);
  revalidatePath(`/${locale}/admin/products/${id}`);
}

async function deleteProduct(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  const locale = String(formData.get('locale') || 'sv');
  await pool.query('DELETE FROM products WHERE id = $1', [id]);
  revalidatePath(`/${locale}/admin/products`);
  redirect(`/${locale}/admin/products`);
}

export default async function ProductDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);

  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
  const p = rows[0];
  if (!p) {
    return <div className="p-6"><h1 className="text-xl font-bold text-red-600">{sv ? 'Produkt hittades inte' : 'Product not found'}</h1></div>;
  }

  const categoriesCsv = Array.isArray(p.categories) ? p.categories.join(', ') : '';
  const tagsCsv = Array.isArray(p.tags) ? p.tags.join(', ') : '';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <a href={`/${locale}/admin/products`} className="text-sm text-blue-600 hover:underline">&larr; {sv ? 'Till produkter' : 'Back to products'}</a>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{sv ? p.name_sv : p.name_en}</h1>
        <div className="text-xs text-gray-500">ID: {p.id}</div>
      </div>

      <form action={updateProduct} className="grid lg:grid-cols-[1fr_320px] gap-6">
        <input type="hidden" name="id" value={p.id} />
        <input type="hidden" name="locale" value={locale} />

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#2A2A2A] dark:border-[#3D3D3D] border rounded">
            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium">{sv ? 'Produktdata' : 'Product data'}</div>
            <div className="p-4 grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-gray-600 mb-1">{sv ? 'Namn (SV)' : 'Name (SV)'}</label>
                <input name="nameSv" defaultValue={p.name_sv} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">{sv ? 'Namn (EN)' : 'Name (EN)'}</label>
                <input name="nameEn" defaultValue={p.name_en} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Slug</label>
                <input name="slug" defaultValue={p.slug} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">SKU</label>
                <input name="sku" defaultValue={p.sku || ''} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">{sv ? 'Produkttyp' : 'Product type'}</label>
                <select name="productType" defaultValue={p.product_type} className="w-full border rounded px-3 py-2">
                  <option value="simple">Simple</option>
                  <option value="variable">Variable</option>
                  <option value="subscription">Subscription</option>
                  <option value="external">External</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">{sv ? 'Lagersaldo' : 'Stock status'}</label>
                <select name="stockStatus" defaultValue={p.stock_status} className="w-full border rounded px-3 py-2">
                  <option value="instock">In stock</option>
                  <option value="outofstock">Out of stock</option>
                  <option value="onbackorder">On backorder</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#2A2A2A] dark:border-[#3D3D3D] border rounded">
            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium">{sv ? 'Priser' : 'Pricing'}</div>
            <div className="p-4 grid md:grid-cols-3 gap-3 text-sm">
              <div>
                <label className="block text-gray-600 mb-1">{sv ? 'Pris' : 'Price'} (SEK)</label>
                <input name="priceSek" type="number" step="0.01" defaultValue={Number(p.price_sek)} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">{sv ? 'Ord. pris' : 'Regular price'}</label>
                <input name="regularPriceSek" type="number" step="0.01" defaultValue={p.regular_price_sek ? Number(p.regular_price_sek) : ''} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">{sv ? 'Reapris' : 'Sale price'}</label>
                <input name="salePriceSek" type="number" step="0.01" defaultValue={p.sale_price_sek ? Number(p.sale_price_sek) : ''} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#2A2A2A] dark:border-[#3D3D3D] border rounded">
            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium">{sv ? 'Beskrivning' : 'Description'}</div>
            <div className="p-4 space-y-3">
              <textarea name="shortDescriptionSv" defaultValue={p.short_description_sv || ''} rows={3} placeholder={sv ? 'Kort beskrivning (SV)' : 'Short description (SV)'} className="w-full border rounded px-3 py-2 text-sm" />
              <textarea name="shortDescriptionEn" defaultValue={p.short_description_en || ''} rows={3} placeholder={sv ? 'Kort beskrivning (EN)' : 'Short description (EN)'} className="w-full border rounded px-3 py-2 text-sm" />
              <textarea name="descriptionSv" defaultValue={p.description_sv || ''} rows={8} placeholder={sv ? 'Lång beskrivning (SV)' : 'Long description (SV)'} className="w-full border rounded px-3 py-2 text-sm" />
              <textarea name="descriptionEn" defaultValue={p.description_en || ''} rows={8} placeholder={sv ? 'Lång beskrivning (EN)' : 'Long description (EN)'} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#2A2A2A] dark:border-[#3D3D3D] border rounded">
            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium">{sv ? 'Taxonomi' : 'Taxonomy'}</div>
            <div className="p-4 grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-gray-600 mb-1">{sv ? 'Kategorier (kommaseparerat)' : 'Categories (comma separated)'}</label>
                <input name="categoriesCsv" defaultValue={categoriesCsv} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">{sv ? 'Taggar (kommaseparerat)' : 'Tags (comma separated)'}</label>
                <input name="tagsCsv" defaultValue={tagsCsv} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white dark:bg-[#2A2A2A] dark:border-[#3D3D3D] border rounded">
            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium">{sv ? 'Publicera' : 'Publish'}</div>
            <div className="p-4 space-y-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={Boolean(p.published)} /> {sv ? 'Publicerad' : 'Published'}</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={Boolean(p.featured)} /> {sv ? 'Utvald' : 'Featured'}</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="downloadable" defaultChecked={Boolean(p.downloadable)} /> {sv ? 'Nedladdningsbar' : 'Downloadable'}</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="virtualProduct" defaultChecked={Boolean(p.virtual_product)} /> {sv ? 'Virtuell' : 'Virtual'}</label>
              <button type="submit" className="w-full px-4 py-2 rounded bg-[#2271b1] text-white font-medium">{sv ? 'Uppdatera produkt' : 'Update product'}</button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#2A2A2A] dark:border-[#3D3D3D] border rounded">
            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium">{sv ? 'Produktbild' : 'Product image'}</div>
            <div className="p-4 space-y-3">
              {p.featured_image_url ? <img src={p.featured_image_url} alt="" className="w-full h-40 object-cover rounded border" /> : <div className="w-full h-40 rounded border bg-gray-50" />}
              <input name="featuredImageUrl" defaultValue={p.featured_image_url || ''} placeholder="https://..." className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#2A2A2A] dark:border-[#3D3D3D] border rounded">
            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium">{sv ? 'Lager' : 'Inventory'}</div>
            <div className="p-4 text-sm">
              <label className="block text-gray-600 mb-1">{sv ? 'Antal i lager' : 'Stock quantity'}</label>
              <input name="stockQuantity" type="number" defaultValue={p.stock_quantity ?? ''} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#2A2A2A] dark:border-[#3D3D3D] border rounded p-4">
            <button formAction={deleteProduct} className="w-full px-4 py-2 rounded border border-red-200 text-red-600 hover:bg-red-50 text-sm">
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="locale" value={locale} />
              {sv ? 'Ta bort produkt' : 'Delete product'}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
