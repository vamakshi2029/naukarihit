import { STATUSES } from '@/lib/helpers';

const BADGE = {
  Applied: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Shortlisted: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Interview: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  Selected: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
};

export function StatusBadge({ status }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[status]}`}>{status}</span>;
}

export function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-teal-700" />
    </div>
  );
}

export function Stat({ label, value, hint, icon: Icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="rounded-xl bg-teal-50 p-3 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

export function Empty({ title, hint, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function Bars({ data }) {
  if (!data.length) return <p className="py-6 text-center text-sm text-slate-400">Nothing to show yet</p>;
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{d.label}</span>
            <span className="font-semibold">{d.value}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-2 rounded-full bg-teal-600 transition-all" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Shows where an application is: Applied > Shortlisted > Interview > Selected
export function Timeline({ status }) {
  const steps = STATUSES.slice(0, 4);
  const rejected = status === 'Rejected';
  const idx = rejected ? 0 : steps.indexOf(status);
  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const done = i <= idx;
        return (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${done ? (rejected ? 'bg-rose-500' : 'bg-teal-600') : 'bg-slate-200 dark:bg-slate-700'}`} />
              <span className={`mt-1 text-xs ${done ? 'font-medium' : 'text-slate-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-1 mb-5 h-0.5 flex-1 ${i < idx ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </div>
        );
      })}
      {rejected && <span className="mb-5 ml-3 text-xs font-medium text-rose-600">Not selected</span>}
    </div>
  );
}
