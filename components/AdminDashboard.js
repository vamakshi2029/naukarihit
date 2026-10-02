'use client';
import { useEffect, useState } from 'react';
import { Users, Briefcase, FileText, Percent } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Stat, Bars, StatusBadge } from './ui';
import { STATUSES, fmtDate } from '@/lib/helpers';

export default function AdminDashboard() {
  const [students, setStudents] = useState(0);
  const [drives, setDrives] = useState([]);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    (async () => {
      const [s, d, a] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('drives').select('id,deadline'),
        supabase.from('applications').select('id,status,applied_at,student_id,drives(company),profiles(full_name)').order('applied_at', { ascending: false }),
      ]);
      setStudents(s.count || 0);
      setDrives(d.data || []);
      setApps(a.data || []);
    })();
  }, []);

  const selected = apps.filter((a) => a.status === 'Selected');
  const placed = new Set(selected.map((a) => a.student_id)).size;
  const pct = students ? Math.round((placed / students) * 100) : 0;
  const active = drives.filter((d) => new Date(d.deadline) > new Date()).length;

  const byStatus = STATUSES.map((s) => ({ label: s, value: apps.filter((a) => a.status === s).length }));
  const offerMap = {};
  selected.forEach((a) => { const c = a.drives?.company || 'Unknown'; offerMap[c] = (offerMap[c] || 0) + 1; });
  const offers = Object.entries(offerMap).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Placement overview</h1>
        <p className="text-slate-500">Live numbers across all drives.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Registered students" value={students} icon={Users} />
        <Stat label="Open drives" value={active} hint={`${drives.length} posted in total`} icon={Briefcase} />
        <Stat label="Applications" value={apps.length} icon={FileText} />
        <Stat label="Placement rate" value={`${pct}%`} hint={`${placed} students placed`} icon={Percent} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-4 text-xl font-bold">Applications by stage</h2>
          <Bars data={byStatus} />
        </section>
        <section className="card">
          <h2 className="mb-4 text-xl font-bold">Offers by company</h2>
          <Bars data={offers} />
        </section>
      </div>
      <section>
        <h2 className="mb-3 text-xl font-bold">Latest activity</h2>
        <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
          {apps.slice(0, 6).map((a) => (
            <div key={a.id} className="flex items-center justify-between px-5 py-3">
              <p className="text-sm">
                <span className="font-medium">{a.profiles?.full_name || 'A student'}</span> applied to {a.drives?.company}
                <span className="ml-2 text-xs text-slate-400">{fmtDate(a.applied_at)}</span>
              </p>
              <StatusBadge status={a.status} />
            </div>
          ))}
          {apps.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">No applications yet</p>}
        </div>
      </section>
    </div>
  );
}
