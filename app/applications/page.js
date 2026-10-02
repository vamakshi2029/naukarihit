'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { useAuth } from '@/components/AuthProvider';
import { Empty, StatusBadge, Timeline } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { fmtDate } from '@/lib/helpers';

function List() {
  const { user } = useAuth();
  const [apps, setApps] = useState(null);

  useEffect(() => {
    supabase
      .from('applications')
      .select('id,status,applied_at,drives(company,role,package_lpa,location)')
      .eq('student_id', user.id)
      .order('applied_at', { ascending: false })
      .then(({ data }) => setApps(data || []));
  }, [user.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My applications</h1>
        <p className="text-slate-500">Track each application from applied to offer.</p>
      </div>
      {apps && apps.length === 0 && (
        <Empty title="No applications yet" hint="Apply to a drive and it will show up here.">
          <Link href="/drives" className="btn-primary">Browse drives</Link>
        </Empty>
      )}
      <div className="space-y-4">
        {(apps || []).map((a) => (
          <div key={a.id} className="card">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold">{a.drives?.company}</h2>
                <p className="text-sm text-slate-500">{a.drives?.role} · {a.drives?.package_lpa} LPA · {a.drives?.location} · applied {fmtDate(a.applied_at)}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
            <Timeline status={a.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Shell>
      <List />
    </Shell>
  );
}
