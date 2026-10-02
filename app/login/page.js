'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    const { email, password, name } = form;
    const { data, error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (mode === 'signup' && !data.session) setMsg('Account created. Check your email to confirm, then log in.');
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-teal-900 p-12 text-teal-50 lg:flex">
        <div className="flex items-center gap-2 font-display text-xl font-bold">
          <GraduationCap /> NaukariHit
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-bold leading-tight">Every drive, every application, one place.</h1>
          <p className="mt-4 max-w-md text-teal-200">
            See only the drives you are eligible for, apply in one click and follow each application from shortlist to offer.
          </p>
        </div>
        <p className="text-sm text-teal-300">College placement management system</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <h2 className="text-3xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
            {['login', 'signup'].map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => { setMode(m); setMsg(''); }}
                className={`rounded-md py-1.5 ${mode === m ? 'bg-white font-medium shadow-sm dark:bg-slate-700' : 'text-slate-500'}`}
              >
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>
          {mode === 'signup' && (
            <div>
              <label className="label">Full name</label>
              <input className="input" required value={form.name} onChange={set('name')} />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" minLength={6} required value={form.password} onChange={set('password')} />
          </div>
          {msg && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">{msg}</p>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
