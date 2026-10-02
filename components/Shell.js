'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GraduationCap, LayoutDashboard, Briefcase, FileText, User, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Spinner } from './ui';

// Wraps every page: protects it (login needed) and draws the top navigation.
export default function Shell({ children, adminOnly = false }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);
  useEffect(() => {
    if (profile && adminOnly && profile.role !== 'admin') router.replace('/dashboard');
  }, [profile, adminOnly, router]);

  if (loading || !user || !profile || (adminOnly && profile.role !== 'admin')) return <Spinner />;

  const isAdmin = profile.role === 'admin';
  const nav = isAdmin
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/drives', label: 'Manage drives', icon: Briefcase },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/drives', label: 'Drives', icon: Briefcase },
        { href: '/applications', label: 'My applications', icon: FileText },
        { href: '/profile', label: 'Profile', icon: User },
      ];

  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setDark(next);
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-bold">
            <GraduationCap className="text-teal-700" /> NaukariHit
          </Link>
          <nav className="flex flex-1 gap-1 overflow-x-auto">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
                  path === href
                    ? 'bg-teal-50 font-medium text-teal-800 dark:bg-teal-900/30 dark:text-teal-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
          <div className="hidden text-right text-sm leading-tight md:block">
            <p className="font-medium">{profile.full_name || profile.email}</p>
            <p className="text-xs text-slate-500">{isAdmin ? 'Placement cell' : 'Student'}</p>
          </div>
          <button onClick={toggleTheme} className="btn-ghost px-2.5" aria-label="Toggle dark mode">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={signOut} className="btn-ghost px-2.5" aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
