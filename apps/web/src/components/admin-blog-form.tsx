'use client';

import { useState } from 'react';

interface BlogFormProps {
  locale: string;
  post?: {
    id: string;
    slug: string;
    title_sv: string;
    title_en: string;
    excerpt_sv: string;
    excerpt_en: string;
    content_sv: string;
    content_en: string;
    featured_image_url: string;
    published: boolean;
  };
  action: (formData: FormData) => Promise<void>;
  deleteAction?: (formData: FormData) => Promise<void>;
}

export function BlogPostForm({ locale, post, action, deleteAction }: BlogFormProps) {
  const sv = locale === 'sv';
  const [activeTab, setActiveTab] = useState<'sv' | 'en'>('sv');

  return (
    <form action={action} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">{sv ? 'Grundinformation' : 'Basic info'}</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            name="slug"
            defaultValue={post?.slug}
            required
            placeholder="mitt-inlagg"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B817]"
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="flex border-b">
            {(['sv', 'en'] as const).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveTab(lang)}
                className={`px-4 py-2 text-sm font-medium ${activeTab === lang ? 'bg-white border-b-2 border-[#E8B817]' : 'bg-gray-50 text-gray-500'}`}
              >
                {lang === 'sv' ? '🇸🇪 Svenska' : '🇬🇧 English'}
              </button>
            ))}
          </div>
          <div className="p-4 space-y-4">
            {(['sv', 'en'] as const).map(lang => (
              <div key={lang} className={activeTab === lang ? '' : 'hidden'}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'sv' ? 'Titel (SV)' : 'Title (EN)'}</label>
                    <input
                      name={`title_${lang}`}
                      defaultValue={lang === 'sv' ? post?.title_sv : post?.title_en}
                      required={lang === 'sv'}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B817]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'sv' ? 'Ingress (SV)' : 'Excerpt (EN)'}</label>
                    <textarea
                      name={`excerpt_${lang}`}
                      defaultValue={lang === 'sv' ? post?.excerpt_sv : post?.excerpt_en}
                      rows={3}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B817]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'sv' ? 'Innehåll (SV)' : 'Content (EN)'} — Markdown</label>
                    <textarea
                      name={`content_${lang}`}
                      defaultValue={lang === 'sv' ? post?.content_sv : post?.content_en}
                      rows={16}
                      className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#E8B817]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">{sv ? 'Media & publicering' : 'Media & publishing'}</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Bild-URL' : 'Featured image URL'}</label>
          <div className="flex gap-2">
            <input
              name="featured_image_url"
              defaultValue={post?.featured_image_url}
              placeholder="https://..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B817]"
            />
            <a
              href={`/${locale}/admin/media`}
              target="_blank"
              className="px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap"
            >
              {sv ? 'Bläddra' : 'Browse'}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="published"
            id="published"
            defaultChecked={post?.published}
            value="true"
            className="w-4 h-4 rounded"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">
            {sv ? 'Publicerad' : 'Published'}
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button type="submit" className="px-5 py-2 bg-[#E8B817] text-white rounded-lg font-medium hover:opacity-90">
            {sv ? 'Spara' : 'Save'}
          </button>
          <a href={`/${locale}/admin/blog`} className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            {sv ? 'Avbryt' : 'Cancel'}
          </a>
        </div>
        {deleteAction && (
          <form action={deleteAction}>
            {post && <input type="hidden" name="id" value={post.id} />}
            <button
              type="submit"
              className="px-5 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
              onClick={(e) => { if (!confirm(sv ? 'Ta bort inlägget?' : 'Delete this post?')) e.preventDefault(); }}
            >
              {sv ? 'Ta bort' : 'Delete'}
            </button>
          </form>
        )}
      </div>
    </form>
  );
}
