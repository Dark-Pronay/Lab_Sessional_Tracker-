import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function SignupPage() {
  return (
    <main className="flex items-center justify-center min-h-dvh p-4">
    <div className="w-full max-w-md">
        <Card className="shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-headline font-bold">LabTracker Pro</h1>
            </div>
            <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
            <CardDescription>
            Join LabTracker Pro as a teacher or student.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <SignupForm />
            <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline text-primary">
                Sign in
            </Link>
            </div>
        </CardContent>
        </Card>
    </div>
    </main>
  );
}
