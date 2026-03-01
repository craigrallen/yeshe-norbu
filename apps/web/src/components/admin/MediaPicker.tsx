'use client';

import { useState, useCallback } from 'react';

interface MediaImage {
  url: string;
  filename: string;
  path: string;
}

interface MediaPickerProps {
  value?: string;
  onChange: (url: string) => void;
  locale?: string;
}

export function MediaPicker({ value, onChange, locale = 'sv' }: MediaPickerProps) {
  const sv = locale === 'sv';
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const openPicker = useCallback(async () => {
    setOpen(true);
    if (images.length === 0) {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/media/scan');
        const data = await res.json();
        setImages(data.images || []);
      } catch (e) {
        console.error('Failed to load media', e);
      } finally {
        setLoading(false);
      }
    }
  }, [images.length]);

  const select = (url: string) => {
    onChange(url);
    setOpen(false);
    setSearch('');
  };

  const filtered = search
    ? images.filter(i => i.filename.toLowerCase().includes(search.toLowerCase()))
    : images;

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="px-3 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap"
      >
        {sv ? 'Välj bild' : 'Choose image'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-900">{sv ? 'Välj mediebild' : 'Choose media image'}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <div className="p-4 border-b">
              <input
                type="text"
                placeholder={sv ? 'Sök...' : 'Search...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B817]"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-gray-400">{sv ? 'Laddar...' : 'Loading...'}</div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-400">{sv ? 'Inga bilder hittades' : 'No images found'}</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {filtered.map(img => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => select(img.url)}
                      className={"group relative aspect-square rounded-lg overflow-hidden border-2 hover:border-[#E8B817] transition-colors " + (value === img.url ? 'border-[#E8B817]' : 'border-transparent')}
                    >
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs truncate">{img.filename}</p>
                      </div>
                      {value === img.url && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-[#E8B817] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">&#x2713;</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                {sv ? 'Avbryt' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
