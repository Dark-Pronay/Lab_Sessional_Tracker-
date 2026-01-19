'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  LogOut,
  GraduationCap,
  PlusCircle,
  Loader2,
  User,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from './ui/button';
import { Chatbot } from './chatbot/chatbot';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
    );
  }

  if (user.role === 'no-profile') {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-4">
            <h1 className="text-2xl font-bold mb-4">Profile Incomplete</h1>
            <p className="mb-4 text-muted-foreground">Your user profile is missing required information.</p>
            <p className="mb-8 text-muted-foreground">Please sign out and sign up again to create your profile correctly.</p>
            <Button onClick={handleLogout}>
                <LogOut className="mr-2"/>
                Sign Out
            </Button>
        </div>
    )
  }

  const isTeacher = user.role === 'teacher';

  const navItems = isTeacher
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/profile', label: 'Profile', icon: User },
        { href: '/courses/create', label: 'New Course', icon: PlusCircle },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/profile', label: 'Profile', icon: User },
      ];

      
  const initial = user.fullName?.charAt(0).toUpperCase() ?? 'U';
  const avatarUrl = `https://placehold.co/200x200/D0CDE9/403896?text=${initial}`;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-bold font-headline group-data-[collapsible=icon]:hidden">
              LabTracker
            </h2>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side:'right', align:'center' }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 p-2">
            <Avatar className="size-8">
              <AvatarImage
                src={avatarUrl}
                alt={user.fullName ?? ''}
              />
              <AvatarFallback>
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold truncate">
                {user.fullName}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Logout', side:'right', align:'center' }}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center h-14 px-4 border-b md:px-6 sticky top-0 bg-card/80 backdrop-blur-sm z-10">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
                {user && <p className="text-sm font-medium">Welcome back, {user.fullName}!</p>}
            </div>
        </header>
        <div className="p-4 md:p-6">{children}</div>
        <Chatbot />
      </SidebarInset>
    </SidebarProvider>
  );
}
