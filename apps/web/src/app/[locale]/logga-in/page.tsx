'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoggaInPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const sv = locale === 'sv';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/${locale}/konto`);
      router.refresh();
    } catch { setError(sv ? 'Serverfel, försök igen' : 'Server error, try again'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🙏</div>
          <h1 className="text-3xl font-bold text-[#58595b]">{sv ? 'Logga in' : 'Sign in'}</h1>
          <p className="text-gray-500 mt-2">{sv ? 'Välkommen tillbaka' : 'Welcome back'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {sv ? 'E-post eller användarnamn' : 'Email or username'}
              </label>
              <input
                type="text" value={identifier} onChange={e => setIdentifier(e.target.value)}
                required autoComplete="username"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f5ca00] focus:border-transparent"
                placeholder={sv ? 'din@email.se eller användarnamn' : 'your@email.com or username'}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">{sv ? 'Lösenord' : 'Password'}</label>
                <Link href={`/${locale}/glomt-losenord`} className="text-xs text-[#f5ca00] hover:underline">
                  {sv ? 'Glömt lösenord?' : 'Forgot password?'}
                </Link>
              </div>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f5ca00] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#58595b] text-white font-semibold py-3.5 rounded-xl hover:bg-[#6b6c6e] disabled:opacity-50 transition-colors"
            >
              {loading ? (sv ? 'Loggar in...' : 'Signing in...') : (sv ? 'Logga in' : 'Sign in')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {sv ? 'Har du inget konto?' : "Don't have an account?"}{' '}
            <Link href={`/${locale}/registrera`} className="text-[#f5ca00] font-medium hover:underline">
              {sv ? 'Skapa konto' : 'Create account'}
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {sv
            ? 'Om du hade ett konto på gamla webbplatsen, använd "Glömt lösenord" för att komma åt ditt konto.'
            : 'If you had an account on the old site, use "Forgot password" to access your account.'}
        </p>
      </div>
    </div>
  );
}
