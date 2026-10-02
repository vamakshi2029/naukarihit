'use client';
import { useEffect, useState } from 'react';
import { MapPin, IndianRupee, Clock, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { Empty } from './ui';
import { checkEligibility, timeLeft } from '@/lib/helpers';

export default function StudentDrives() {
  const { user, profile } = useAuth();
  const [drives, setDrives] = useState([]);
  const [applied, setApplied] = useState(new Set());
  const [q, setQ] = useState('');
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [busy, setBusy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [d, a] = await Promise.all([
        supabase.from('drives').select('*').order('deadline'),
        supabase.from('applications').select('drive_id').eq('student_id', user.id),
      ]);
      setDrives(d.data || []);
      setApplied(new Set((a.data || []).map((x) => x.drive_id)));
      setLoading(false);
    })();
  }, [user.id]);

  async function apply(drive) {
    setBusy(drive.id);
    const { error } = await supabase.from('applications').insert({ drive_id: drive.id, student_id: user.id });
    if (error) alert(error.message);
    else setApplied(new Set([...applied, drive.id]));
    setBusy(null);
  }

  const list = drives
    .map((d) => ({ d, el: checkEligibility(d, profile) }))
    .filter(({ d, el }) => d.company.toLowerCase().includes(q.toLowerCase()) && (!onlyEligible || el.ok));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Placement drives</h1>
        <p className="text-slate-500">Drives you do not qualify for are greyed out, with the reason.</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <input className="input max-w-xs" placeholder="Search by company" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyEligible} onChange={(e) => setOnlyEligible(e.target.checked)} /> Show only drives I can apply to
        </label>
      </div>
      {loading ? null : list.length === 0 ? (
        <Empty title="No drives found" hint="Try clearing the search or the eligibility filter." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map(({ d, el }) => {
            const done = applied.has(d.id);
            return (
              <div key={d.id} className={`card flex flex-col ${!el.ok && !done ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{d.company}</h2>
                    <p className="text-sm text-slate-500">{d.role}</p>
                  </div>
                  <span className={`flex items-center gap-1 whitespace-nowrap text-xs font-medium ${timeLeft(d.deadline) === 'Closed' ? 'text-slate-400' : 'text-amber-600'}`}>
                    <Clock size={13} /> {timeLeft(d.deadline)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1"><IndianRupee size={14} />{d.package_lpa} LPA</span>
                  <span className="flex items-center gap-1"><MapPin size={14} />{d.location}</span>
                  <span>CGPA {d.min_cgpa}+</span>
                </div>
                {d.description && <p className="mt-3 text-sm text-slate-500">{d.description}</p>}
                <p className="mt-3 text-xs text-slate-400">Open to: {d.branches?.length ? d.branches.join(', ') : 'all branches'}</p>
                <div className="mt-auto pt-4">
                  {done ? (
                    <button className="btn-ghost w-full" disabled><Check size={16} /> Applied</button>
                  ) : el.ok ? (
                    <button className="btn-primary w-full" disabled={busy === d.id} onClick={() => apply(d)}>
                      {busy === d.id ? 'Applying...' : 'Apply now'}
                    </button>
                  ) : (
                    <p className="rounded-lg bg-slate-100 px-3 py-2 text-center text-sm text-slate-500 dark:bg-slate-800">{el.reason}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
