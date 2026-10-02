'use client';
import Shell from '@/components/Shell';
import { useAuth } from '@/components/AuthProvider';
import StudentDashboard from '@/components/StudentDashboard';
import AdminDashboard from '@/components/AdminDashboard';

function Inner() {
  const { profile } = useAuth();
  return profile.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
}

export default function DashboardPage() {
  return (
    <Shell>
      <Inner />
    </Shell>
  );
}
