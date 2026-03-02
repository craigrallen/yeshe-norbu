'use client';

import { useState } from 'react';
import Link from 'next/link';

export function BlogBulkActions({ posts, locale, sv, bulkDelete, bulkPublish }: {
  posts: any[];
  locale: string;
  sv: boolean;
  bulkDelete: (fd: FormData) => Promise<void>;
  bulkPublish: (fd: FormData) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === posts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(posts.map(p => p.id)));
    }
  }

  async function doAction(action: 'delete' | 'publish' | 'unpublish') {
    if (!selected.size) return;
    const fd = new FormData();
    fd.set('locale', locale);
    selected.forEach(id => fd.append('ids', id));
    if (action === 'delete') {
      if (!confirm(sv ? 'Radera markerade inlägg?' : 'Delete selected posts?')) return;
      await bulkDelete(fd);
    } else {
      fd.set('publishState', action === 'publish' ? 'true' : 'false');
      await bulkPublish(fd);
    }
    setSelected(new Set());
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{selected.size} {sv ? 'markerade' : 'selected'}</span>
          <button onClick={() => doAction('publish')} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:opacity-80">
            {sv ? 'Publicera' : 'Publish'}
          </button>
          <button onClick={() => doAction('unpublish')} className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:opacity-80">
            {sv ? 'Avpublicera' : 'Unpublish'}
          </button>
          <button onClick={() => doAction('delete')} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:opacity-80">
            {sv ? 'Radera' : 'Delete'}
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-blue-600 dark:text-blue-300 hover:underline">
            {sv ? 'Avmarkera' : 'Deselect'}
          </button>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={selected.size === posts.length && posts.length > 0} onChange={toggleAll} className="w-4 h-4 rounded" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{sv ? 'Titel' : 'Title'}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{sv ? 'Datum' : 'Date'}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {posts.map((p) => {
              const title = sv ? p.title_sv : (p.title_en || p.title_sv);
              const date = p.published_at || p.created_at;
              return (
                <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${selected.has(p.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="w-4 h-4 rounded" />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    <div>{title}</div>
                    <div className="text-xs text-gray-400">{p.slug}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{date ? new Date(date).toLocaleDateString(sv ? 'sv-SE' : 'en-GB') : '—'}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${p.published ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      {p.published ? (sv ? 'Publicerad' : 'Published') : (sv ? 'Utkast' : 'Draft')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right flex gap-3 justify-end">
                    <Link href={`/${locale}/blog/${p.slug}`} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">{sv ? 'Visa' : 'View'}</Link>
                    <Link href={`/${locale}/admin/blog/${p.id}`} className="text-[#E8B817] hover:opacity-70 text-sm font-medium">{sv ? 'Redigera' : 'Edit'}</Link>
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">{sv ? 'Inga inlägg ännu.' : 'No posts yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
