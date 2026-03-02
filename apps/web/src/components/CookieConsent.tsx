'use client';

import { useEffect, useState } from 'react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookie-consent');
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-2xl">
          Vi använder cookies för att förbättra din upplevelse. / We use cookies to improve your experience.{' '}
          <a href="/sv/integritetspolicy" className="underline hover:no-underline">Läs mer / Read more</a>
        </p>
        <button
          onClick={accept}
          className="shrink-0 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:opacity-80 transition-opacity"
        >
          Acceptera / Accept
        </button>
      </div>
    </div>
  );
}
