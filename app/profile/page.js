'use client';
import { useState } from 'react';
import Shell from '@/components/Shell';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { BRANCHES } from '@/lib/helpers';

function Form() {
  const { profile, refreshProfile } = useAuth();
  const [f, setF] = useState({
    full_name: profile.full_name || '', phone: profile.phone || '', branch: profile.branch || '',
    cgpa: profile.cgpa ?? '', grad_year: profile.grad_year ?? '', skills: profile.skills || '', resume_url: profile.resume_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setSaved(false); };

  const fields = ['full_name', 'phone', 'branch', 'cgpa', 'grad_year', 'skills', 'resume_url'];
  const filled = fields.filter((k) => String(f[k]).trim() !== '').length;

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      ...f,
      cgpa: f.cgpa === '' ? null : Number(f.cgpa),
      grad_year: f.grad_year === '' ? null : Number(f.grad_year),
    }).eq('id', profile.id);
    setSaving(false);
    if (error) return alert(error.message);
    await refreshProfile();
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your profile</h1>
        <p className="text-slate-500">Branch and CGPA decide which drives you can apply to.</p>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Profile complete</span><span>{Math.round((filled / fields.length) * 100)}%</span></div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-2 rounded-full bg-teal-600 transition-all" style={{ width: `${(filled / fields.length) * 100}%` }} /></div>
      </div>
      <form onSubmit={save} className="card grid gap-4 sm:grid-cols-2">
        <div><label className="label">Full name</label><input className="input" required value={f.full_name} onChange={set('full_name')} /></div>
        <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={set('phone')} /></div>
        <div>
          <label className="label">Branch</label>
          <select className="input" required value={f.branch} onChange={set('branch')}>
            <option value="">Select branch</option>
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div><label className="label">CGPA</label><input className="input" type="number" step="0.01" min="0" max="10" required value={f.cgpa} onChange={set('cgpa')} /></div>
        <div><label className="label">Graduation year</label><input className="input" type="number" value={f.grad_year} onChange={set('grad_year')} /></div>
        <div><label className="label">Resume link (Google Drive or similar)</label><input className="input" type="url" value={f.resume_url} onChange={set('resume_url')} /></div>
        <div className="sm:col-span-2"><label className="label">Skills</label><textarea className="input" rows={2} placeholder="Python, React, SQL..." value={f.skills} onChange={set('skills')} /></div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
          {saved && <span className="text-sm text-emerald-600">Saved</span>}
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Shell>
      <Form />
    </Shell>
  );
}
