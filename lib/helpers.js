export const BRANCHES = ['CSE', 'CSBS', 'IT', 'AI&DS', 'ENTC', 'Electrical', 'Mechanical', 'Civil'];
export const STATUSES = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

// Decides if a student can apply to a drive, and explains why not.
export function checkEligibility(drive, profile) {
  if (!profile.branch || profile.cgpa == null)
    return { ok: false, reason: 'Add your branch and CGPA in Profile first' };
  if (new Date(drive.deadline) < new Date())
    return { ok: false, reason: 'Applications are closed' };
  if (Number(profile.cgpa) < Number(drive.min_cgpa))
    return { ok: false, reason: `Needs CGPA ${drive.min_cgpa}+ (yours is ${profile.cgpa})` };
  if (drive.branches?.length && !drive.branches.includes(profile.branch))
    return { ok: false, reason: `Open to ${drive.branches.join(', ')} only` };
  return { ok: true };
}

export function timeLeft(deadline) {
  const ms = new Date(deadline) - new Date();
  if (ms <= 0) return 'Closed';
  const d = Math.floor(ms / 864e5);
  const h = Math.floor((ms % 864e5) / 36e5);
  return d > 0 ? `${d}d ${h}h left` : `${h}h left`;
}

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function toLocalInput(iso) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename;
  a.click();
}
