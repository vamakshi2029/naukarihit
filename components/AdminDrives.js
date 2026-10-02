'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Empty } from './ui';
import { BRANCHES, fmtDate, toLocalInput, timeLeft } from '@/lib/helpers';

const blank = { company: '', role: '', description: '', package_lpa: '', location: '', min_cgpa: 6, branches: [], deadline: '' };

export default function AdminDrives() {
  const [drives, setDrives] = useState([]);
  const [counts, setCounts] = useState({});
  const [form, setForm] = useState(null); // null = hidden
  const [saving, setSaving] = useState(false);

  async function load() {
    const [d, a] = await Promise.all([
      supabase.from('drives').select('*').order('deadline', { ascending: false }),
      supabase.from('applications').select('drive_id'),
    ]);
    setDrives(d.data || []);
    const c = {};
    (a.data || []).forEach((x) => (c[x.drive_id] = (c[x.drive_id] || 0) + 1));
    setCounts(c);
  }
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleBranch = (b) =>
    setForm({ ...form, branches: form.branches.includes(b) ? form.branches.filter((x) => x !== b) : [...form.branches, b] });

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const { id, created_at, ...rest } = form;
    const payload = { ...rest, package_lpa: Number(rest.package_lpa), min_cgpa: Number(rest.min_cgpa), deadline: new Date(rest.deadline).toISOString() };
    const { error } = id ? await supabase.from('drives').update(payload).eq('id', id) : await supabase.from('drives').insert(payload);
    setSaving(false);
    if (error) return alert(error.message);
    setForm(null);
    load();
  }

  async function remove(d) {
    if (!confirm(`Delete the ${d.company} drive and all its applications?`)) return;
    await supabase.from('drives').delete().eq('id', d.id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Manage drives</h1>
          <p className="text-slate-500">Post drives and review who applied.</p>
        </div>
        {!form && <button className="btn-primary" onClick={() => setForm(blank)}><Plus size={16} /> New drive</button>}
      </div>

      {form && (
        <form onSubmit={save} className="card grid gap-4 md:grid-cols-2">
          <h2 className="text-xl font-bold md:col-span-2">{form.id ? 'Edit drive' : 'New drive'}</h2>
          <div><label className="label">Company</label><input className="input" required value={form.company} onChange={set('company')} /></div>
          <div><label className="label">Role</label><input className="input" required value={form.role} onChange={set('role')} /></div>
          <div><label className="label">Package (LPA)</label><input className="input" type="number" step="0.1" required value={form.package_lpa} onChange={set('package_lpa')} /></div>
          <div><label className="label">Location</label><input className="input" required value={form.location} onChange={set('location')} /></div>
          <div><label className="label">Minimum CGPA</label><input className="input" type="number" step="0.1" min="0" max="10" required value={form.min_cgpa} onChange={set('min_cgpa')} /></div>
          <div><label className="label">Apply by</label><input className="input" type="datetime-local" required value={form.deadline} onChange={set('deadline')} /></div>
          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description || ''} onChange={set('description')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Eligible branches (leave all unselected to allow every branch)</label>
            <div className="flex flex-wrap gap-2">
              {BRANCHES.map((b) => (
                <button type="button" key={b} onClick={() => toggleBranch(b)}
                  className={`rounded-full border px-3 py-1 text-sm ${form.branches.includes(b) ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 md:col-span-2">
            <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save drive'}</button>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}

      {drives.length === 0 ? (
        <Empty title="No drives posted yet" hint="Use New drive to post the first one." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Package</th>
                <th className="px-5 py-3 font-medium">Min CGPA</th>
                <th className="px-5 py-3 font-medium">Deadline</th>
                <th className="px-5 py-3 font-medium">Applicants</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {drives.map((d) => (
                <tr key={d.id}>
                  <td className="px-5 py-3"><p className="font-medium">{d.company}</p><p className="text-xs text-slate-500">{d.role}</p></td>
                  <td className="px-5 py-3">{d.package_lpa} LPA</td>
                  <td className="px-5 py-3">{d.min_cgpa}</td>
                  <td className="px-5 py-3">{fmtDate(d.deadline)}<p className="text-xs text-slate-400">{timeLeft(d.deadline)}</p></td>
                  <td className="px-5 py-3">
                    <Link href={`/drives/${d.id}`} className="inline-flex items-center gap-1 font-medium text-teal-700 hover:underline dark:text-teal-300">
                      <Users size={14} /> {counts[d.id] || 0}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="btn-ghost px-2" aria-label="Edit" onClick={() => setForm({ ...d, deadline: toLocalInput(d.deadline) })}><Pencil size={15} /></button>
                      <button className="btn-danger px-2" aria-label="Delete" onClick={() => remove(d)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
