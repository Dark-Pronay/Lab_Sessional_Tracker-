import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-dvh p-4">
    <div className="w-full max-w-md">
        <Card className="shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-headline font-bold">LabTracker Pro</h1>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
            <CardDescription>
            Sign in to access your dashboard.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <LoginForm />
            <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline text-primary">
                Sign up
            </Link>
            </div>
        </CardContent>
        </Card>
    </div>
    </main>
  );
}
