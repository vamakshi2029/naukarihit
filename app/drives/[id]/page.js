'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import Shell from '@/components/Shell';
import { Empty } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { STATUSES, fmtDate, downloadCSV } from '@/lib/helpers';

function Applicants() {
  const { id } = useParams();
  const [drive, setDrive] = useState(null);
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    (async () => {
      const [d, a] = await Promise.all([
        supabase.from('drives').select('*').eq('id', id).single(),
        supabase.from('applications').select('id,status,applied_at,profiles(full_name,email,phone,branch,cgpa,resume_url)').eq('drive_id', id).order('applied_at'),
      ]);
      setDrive(d.data);
      setApps(a.data || []);
    })();
  }, [id]);

  async function setStatus(appId, status) {
    setApps(apps.map((a) => (a.id === appId ? { ...a, status } : a)));
    const { error } = await supabase.from('applications').update({ status }).eq('id', appId);
    if (error) alert(error.message);
  }

  function exportCSV() {
    downloadCSV(
      `${drive.company}-applicants.csv`,
      apps.map((a) => ({
        Name: a.profiles?.full_name, Email: a.profiles?.email, Phone: a.profiles?.phone,
        Branch: a.profiles?.branch, CGPA: a.profiles?.cgpa, Resume: a.profiles?.resume_url,
        Status: a.status, Applied: fmtDate(a.applied_at),
      }))
    );
  }

  const shown = filter === 'All' ? apps : apps.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <Link href="/drives" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:underline"><ArrowLeft size={14} /> All drives</Link>
      {drive && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{drive.company}</h1>
            <p className="text-slate-500">{drive.role} · {apps.length} applicant{apps.length === 1 ? '' : 's'}</p>
          </div>
          <button className="btn-ghost" disabled={!apps.length} onClick={exportCSV}><Download size={16} /> Export CSV</button>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {['All', ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-sm ${filter === s ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
            {s}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <Empty title="No applicants here" hint="Students appear as soon as they apply." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Branch</th>
                <th className="px-5 py-3 font-medium">CGPA</th>
                <th className="px-5 py-3 font-medium">Resume</th>
                <th className="px-5 py-3 font-medium">Applied</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {shown.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3"><p className="font-medium">{a.profiles?.full_name}</p><p className="text-xs text-slate-500">{a.profiles?.email}</p></td>
                  <td className="px-5 py-3">{a.profiles?.branch || '-'}</td>
                  <td className="px-5 py-3">{a.profiles?.cgpa ?? '-'}</td>
                  <td className="px-5 py-3">
                    {a.profiles?.resume_url ? (
                      <a href={a.profiles.resume_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-teal-700 hover:underline dark:text-teal-300">View <ExternalLink size={12} /></a>
                    ) : '-'}
                  </td>
                  <td className="px-5 py-3">{fmtDate(a.applied_at)}</td>
                  <td className="px-5 py-3">
                    <select className="input py-1" value={a.status} onChange={(e) => setStatus(a.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
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

export default function ApplicantsPage() {
  return (
    <Shell adminOnly>
      <Applicants />
    </Shell>
  );
}
