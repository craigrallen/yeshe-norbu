'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegistreraPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const sv = locale === 'sv';

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/${locale}/konto`);
    } catch { setError(sv ? 'Serverfel, försök igen' : 'Server error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🙏</div>
          <h1 className="text-3xl font-bold text-[#58595b]">{sv ? 'Skapa konto' : 'Create account'}</h1>
          <p className="text-gray-500 mt-2">{sv ? 'Gå med i vår gemenskap' : 'Join our community'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Förnamn' : 'First name'}</label>
                <input type="text" value={form.firstName} onChange={set('firstName')} required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f5ca00]"
                  placeholder={sv ? 'Anna' : 'Anna'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Efternamn' : 'Last name'}</label>
                <input type="text" value={form.lastName} onChange={set('lastName')}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f5ca00]"
                  placeholder={sv ? 'Svensson' : 'Svensson'} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'E-postadress' : 'Email'}</label>
              <input type="email" value={form.email} onChange={set('email')} required autoComplete="email"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f5ca00]"
                placeholder="din@email.se" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Lösenord' : 'Password'}</label>
              <input type="password" value={form.password} onChange={set('password')} required minLength={8}
                autoComplete="new-password"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f5ca00]"
                placeholder={sv ? 'Minst 8 tecken' : 'At least 8 characters'} />
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-[#f5ca00] text-white font-semibold py-3.5 rounded-xl hover:bg-[#d4af00] disabled:opacity-50 transition-colors">
              {loading ? (sv ? 'Skapar konto...' : 'Creating...') : (sv ? 'Skapa konto' : 'Create account')}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            {sv
              ? 'Genom att skapa ett konto godkänner du vår integritetspolicy och GDPR-regler.'
              : 'By creating an account you agree to our privacy policy and GDPR terms.'}
          </p>

          <div className="mt-4 text-center text-sm text-gray-500">
            {sv ? 'Har du redan ett konto?' : 'Already have an account?'}{' '}
            <Link href={`/${locale}/logga-in`} className="text-[#f5ca00] font-medium hover:underline">
              {sv ? 'Logga in' : 'Sign in'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
