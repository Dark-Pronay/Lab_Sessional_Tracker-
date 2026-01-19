'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Briefcase, BookOpen } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function ProfileContent() {
  const { user, logout } = useAuth();

  if (!user || user.role === 'no-profile') {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const initial = user.fullName?.charAt(0).toUpperCase() ?? 'U';
  const avatarUrl = `https://placehold.co/200x200/D0CDE9/403896?text=${initial}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button asChild variant="outline">
            <Link href="/">← Back to Home</Link>
          </Button>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={logout} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-headline">My Profile</CardTitle>
              <CardDescription>Developer 1: Authentication & Profile Management</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:text-left text-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl} alt={user.fullName ?? ''} />
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 flex-grow">
                    <h2 className="text-2xl font-semibold">{user.fullName}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                      <span>School ID:</span>
                      <p className="font-mono text-xs bg-secondary text-secondary-foreground rounded px-2 py-1">
                        {user.schoolId || 'Not set'}
                      </p>
                    </div>

                    <Badge variant={user.role === 'teacher' ? 'default' : 'secondary'} className="capitalize">
                      {user.role === 'teacher' ? (
                        <Briefcase className="mr-1.5 h-3.5 w-3.5" />
                      ) : (
                        <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {user.role}
                    </Badge>
                  </div>
                </div>

                {/* Developer 1 Features */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Authentication Features Available</CardTitle>
                    <CardDescription>Developer 1's implemented functionality</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>✅ User Authentication (Login/Signup)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>✅ Profile Management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>✅ Role-based Access Control</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>✅ Theme Management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>⏳ Course Management (Developer 2)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>⏳ Performance Analytics (Developer 3)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Database Info */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Database Collections</CardTitle>
                    <CardDescription>Developer 1's database structure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="bg-secondary px-2 py-1 rounded text-xs">users</code>
                        <span>- User profiles and authentication data</span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-2">
                        Additional collections (courses, enrollments, performance) will be added by other developers.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ProfileContent />
    </ThemeProvider>
  );
}