'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Send, CalendarClock, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { Stat, StatusBadge, Empty } from './ui';
import { checkEligibility, timeLeft, fmtDate } from '@/lib/helpers';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [apps, setApps] = useState([]);
  const [drives, setDrives] = useState([]);

  useEffect(() => {
    (async () => {
      const [a, d] = await Promise.all([
        supabase.from('applications').select('id,status,applied_at,drive_id,drives(company,role)').eq('student_id', user.id).order('applied_at', { ascending: false }),
        supabase.from('drives').select('*').gt('deadline', new Date().toISOString()).order('deadline'),
      ]);
      setApps(a.data || []);
      setDrives(d.data || []);
    })();
  }, [user.id]);

  const appliedIds = new Set(apps.map((a) => a.drive_id));
  const open = drives.filter((d) => !appliedIds.has(d.id) && checkEligibility(d, profile).ok).slice(0, 3);
  const count = (s) => apps.filter((a) => a.status === s).length;
  const incomplete = !profile.branch || profile.cgpa == null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Hello, {(profile.full_name || 'there').split(' ')[0]}</h1>
        <p className="text-slate-500">Here is where your placement season stands.</p>
      </div>

      {incomplete && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
          <span>Add your branch and CGPA so NaukariHit can show the drives you are eligible for.</span>
          <Link href="/profile" className="btn-primary">Complete profile</Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Applications sent" value={apps.length} icon={Send} />
        <Stat label="Shortlisted or in interviews" value={count('Shortlisted') + count('Interview')} icon={CalendarClock} />
        <Stat label="Offers" value={count('Selected')} icon={Trophy} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xl font-bold">Closing soon for you</h2>
          {open.length === 0 ? (
            <Empty title="No open drives match you right now" hint="New drives appear here as the placement cell posts them." />
          ) : (
            <div className="space-y-3">
              {open.map((d) => (
                <Link key={d.id} href="/drives" className="card block transition hover:border-teal-600">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{d.company}</p>
                    <span className="text-xs font-medium text-amber-600">{timeLeft(d.deadline)}</span>
                  </div>
                  <p className="text-sm text-slate-500">{d.role} · {d.package_lpa} LPA</p>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section>
          <h2 className="mb-3 text-xl font-bold">Recent applications</h2>
          {apps.length === 0 ? (
            <Empty title="You have not applied yet" hint="Open the Drives page and apply to your first one.">
              <Link href="/drives" className="btn-primary">Browse drives</Link>
            </Empty>
          ) : (
            <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
              {apps.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="font-medium">{a.drives?.company}</p>
                    <p className="text-xs text-slate-500">{a.drives?.role} · applied {fmtDate(a.applied_at)}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
