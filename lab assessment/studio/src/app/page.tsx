'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { LogIn, UserPlus, User, Palette, Shield, Smartphone } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemeProvider } from '@/components/theme-provider';

function LandingContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold font-headline text-primary">LabTracker Pro</h1>
            <p className="text-muted-foreground mt-2">Developer 1: Authentication & UI Foundation</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <Badge variant="outline" className="px-3 py-1">
                <User className="w-4 h-4 mr-2" />
                {user.fullName || user.email}
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Authentication System & UI Foundation</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This module demonstrates Developer 1's contribution: a complete authentication system 
              with Firebase integration and a comprehensive UI component library.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Authentication System
                </CardTitle>
                <CardDescription>
                  Complete user authentication with Firebase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• User login and signup</li>
                  <li>• Role-based access (teacher/student)</li>
                  <li>• Profile management</li>
                  <li>• Secure Firebase integration</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  UI Component Library
                </CardTitle>
                <CardDescription>
                  35+ accessible UI components with Radix UI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Complete design system</li>
                  <li>• Dark/light theme support</li>
                  <li>• Responsive components</li>
                  <li>• Tailwind CSS styling</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            {!user ? (
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/signup">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/profile">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Course management and analytics features will be added by Developer 2 and Developer 3.
                </p>
              </div>
            )}
          </div>

          {/* Developer Info */}
          <Card className="mt-12 bg-muted/50">
            <CardHeader>
              <CardTitle>Developer 1 Contribution</CardTitle>
              <CardDescription>Authentication & UI Foundation (40% of codebase)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Technologies Used:</h4>
                  <ul className="space-y-1">
                    <li>• Next.js 15.5.9</li>
                    <li>• React 19.2.1</li>
                    <li>• Firebase 11.9.1</li>
                    <li>• Tailwind CSS</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    <li>• User authentication</li>
                    <li>• Profile management</li>
                    <li>• UI component library</li>
                    <li>• Theme management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Database:</h4>
                  <ul className="space-y-1">
                    <li>• users collection</li>
                    <li>• User profiles</li>
                    <li>• Role management</li>
                    <li>• Authentication data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LandingContent />
    </ThemeProvider>
  );
}