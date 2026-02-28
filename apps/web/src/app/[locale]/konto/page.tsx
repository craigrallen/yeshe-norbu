'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string; email: string; first_name: string; last_name: string;
  locale: string; membership_status?: string; plan_name?: string;
}

export default function KontoPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const sv = locale === 'sv';

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.user) router.push(`/${locale}/logga-in`);
        else setUser(d.user);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${locale}/logga-in`);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center">
      <div className="text-gray-400">{sv ? 'Laddar...' : 'Loading...'}</div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2C2C2C]">
              {sv ? `Hej, ${user.first_name}! 🙏` : `Hello, ${user.first_name}! 🙏`}
            </h1>
            <p className="text-gray-500 mt-1">{user.email}</p>
          </div>
          <button onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-4 py-2 rounded-xl transition-colors">
            {sv ? 'Logga ut' : 'Sign out'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Membership card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-[#2C2C2C] mb-4">{sv ? 'Ditt medlemskap' : 'Your membership'}</h2>
            {user.membership_status === 'active' ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                  <span className="text-green-600 font-medium text-sm">{sv ? 'Aktivt' : 'Active'}</span>
                </div>
                <p className="text-xl font-bold text-[#2C2C2C]">{user.plan_name}</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-sm mb-4">{sv ? 'Du har inget aktivt medlemskap.' : 'No active membership.'}</p>
                <Link href={`/${locale}/bli-medlem`}
                  className="inline-block bg-[#F5A623] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#e09520] transition-colors text-sm">
                  {sv ? 'Bli medlem' : 'Become a member'}
                </Link>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-[#2C2C2C] mb-4">{sv ? 'Snabblänkar' : 'Quick links'}</h2>
            <div className="space-y-2">
              {[
                { href: `/${locale}/events`, label: sv ? '📅 Kommande evenemang' : '📅 Upcoming events' },
                { href: `/${locale}/bli-medlem`, label: sv ? '🌟 Uppgradera medlemskap' : '🌟 Upgrade membership' },
                { href: `/${locale}/blog`, label: sv ? '📝 Blogg & teachings' : '📝 Blog & teachings' },
              ].map(link => (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F9F7F4] transition-colors text-[#2C2C2C]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:col-span-2">
            <h2 className="font-semibold text-[#2C2C2C] mb-4">{sv ? 'Kontoinformation' : 'Account info'}</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">{sv ? 'Namn' : 'Name'}</p>
                <p className="font-medium">{user.first_name} {user.last_name}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">{sv ? 'E-post' : 'Email'}</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">{sv ? 'Språk' : 'Language'}</p>
                <p className="font-medium">{user.locale === 'sv' ? 'Svenska' : 'English'}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link href={`/${locale}/glomt-losenord`}
                className="text-sm text-[#F5A623] hover:underline">
                {sv ? 'Ändra lösenord' : 'Change password'}
              </Link>
            </div>
          </div>
        </div>

        {/* Migrated account notice */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <strong>{sv ? 'Gammal användare?' : 'Old user?'}</strong>{' '}
          {sv
            ? 'Om du hade ett konto på yeshinnorbu.se (WordPress) fungerar ditt gamla lösenord inte direkt. Klicka "Glömt lösenord?" för att sätta ett nytt.'
            : 'If you had an account on yeshinnorbu.se (WordPress), your old password won\'t work. Use "Forgot password?" to set a new one.'}
        </div>
      </div>
    </div>
  );
}
