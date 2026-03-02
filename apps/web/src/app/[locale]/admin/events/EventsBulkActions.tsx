'use client';

import { useState } from 'react';

export function EventsBulkActions({ rows, locale, sv, togglePublish, deleteEvent, bulkDelete }: {
  rows: any[];
  locale: string;
  sv: boolean;
  togglePublish: (fd: FormData) => Promise<void>;
  deleteEvent: (fd: FormData) => Promise<void>;
  bulkDelete: (fd: FormData) => Promise<void>;
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
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map(r => r.id)));
  }

  async function doBulkDelete() {
    if (!selected.size) return;
    if (!confirm(sv ? 'Radera markerade evenemang?' : 'Delete selected events?')) return;
    const fd = new FormData();
    fd.set('locale', locale);
    selected.forEach(id => fd.append('ids', id));
    await bulkDelete(fd);
    setSelected(new Set());
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{selected.size} {sv ? 'markerade' : 'selected'}</span>
          <button onClick={doBulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:opacity-80">
            {sv ? 'Radera markerade' : 'Delete selected'}
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-blue-600 dark:text-blue-300 hover:underline">
            {sv ? 'Avmarkera' : 'Deselect'}
          </button>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} className="w-4 h-4 rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{sv ? 'Titel' : 'Title'}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{sv ? 'Datum' : 'Date'}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{sv ? 'Plats' : 'Venue'}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {rows.map((e) => (
                <tr key={e.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${selected.has(e.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} className="w-4 h-4 rounded" />
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <a href={`/${locale}/admin/events/${e.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{sv ? e.titleSv : e.titleEn}</a>
                    <div className="text-xs text-gray-400">/{e.slug}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{new Date(e.startsAt).toLocaleString('sv-SE')}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{e.venue || '—'}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${e.published ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200'}`}>
                      {e.published ? (sv ? 'Publicerad' : 'Published') : (sv ? 'Utkast' : 'Draft')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <form action={togglePublish}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="next" value={(!e.published).toString()} />
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium">
                          {e.published ? (sv ? 'Avpublicera' : 'Unpublish') : (sv ? 'Publicera' : 'Publish')}
                        </button>
                      </form>
                      <form action={deleteEvent}>
                        <input type="hidden" name="id" value={e.id} />
                        <button className="text-red-600 hover:text-red-800 text-sm">{sv ? 'Ta bort' : 'Delete'}</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">{sv ? 'Inga evenemang ännu' : 'No events yet'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
