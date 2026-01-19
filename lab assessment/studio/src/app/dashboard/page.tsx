'use client';

import { AppShell } from '@/components/app-shell';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  return (
    <AppShell>
      <div className="container mx-auto py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : user?.role === 'teacher' ? (
          <TeacherDashboard />
        ) : user?.role === 'student' ? (
          <StudentDashboard />
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="mt-4">Please complete your profile to access the dashboard.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
