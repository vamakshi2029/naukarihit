'use client';
import Shell from '@/components/Shell';
import { useAuth } from '@/components/AuthProvider';
import StudentDrives from '@/components/StudentDrives';
import AdminDrives from '@/components/AdminDrives';

function Inner() {
  const { profile } = useAuth();
  return profile.role === 'admin' ? <AdminDrives /> : <StudentDrives />;
}

export default function DrivesPage() {
  return (
    <Shell>
      <Inner />
    </Shell>
  );
}
