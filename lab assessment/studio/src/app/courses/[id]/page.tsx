'use client';

import { AppShell } from "@/components/app-shell";
import { StudentPerformanceTable } from "@/components/courses/student-performance-table";
import { StudentProgressView } from "@/components/courses/student-progress-view";
import { useAuth } from "@/contexts/auth-context";
import type { Course } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, GraduationCap, Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function CoursePage() {
    const params = useParams();
    const courseId = params.id as string;

    const { user, loading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const firestore = useFirestore();

    const courseRef = useMemoFirebase(() => {
        if (!courseId || !user) return null;
        return doc(firestore, 'courses', courseId);
    }, [firestore, courseId, user]);
    const { data: course, isLoading: isLoadingCourse } = useDoc<Course>(courseRef);
    
    const enrollmentsQuery = useMemoFirebase(() => {
        if (!courseId || !user) return null;
        return query(collection(firestore, 'enrollments'), where('courseId', '==', courseId));
    }, [firestore, courseId, user]);
    const { data: enrolledStudents, isLoading: isLoadingEnrollments } = useCollection(enrollmentsQuery);

    const isLoading = isAuthLoading || isLoadingCourse || isLoadingEnrollments;

    if (isLoading) {
        return <AppShell><div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div></AppShell>;
    }
    
    if (!course) {
        return <AppShell><div>Course not found</div></AppShell>;
    }

    const copyJoinCode = () => {
        if (!course.joinCode) return;
        navigator.clipboard.writeText(course.joinCode);
        toast({ title: "Copied!", description: "Join code copied to clipboard." });
    };

    const isTeacher = user?.uid === course.teacherId;

    return (
        <AppShell>
            <div className="space-y-6">
                <div className="bg-card p-6 rounded-lg shadow-md">
                    <div className="flex flex-col md:flex-row justify-between md:items-start">
                        <div>
                            <Badge>{course.courseCode}</Badge>
                            <h1 className="text-3xl font-bold font-headline mt-2">{course.courseName}</h1>
                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                <span>Taught by {course.teacherName}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                                <Award className="mr-2 h-4 w-4" />
                                <span>{course.credit ?? 1.5} Credits</span>
                            </div>
                        </div>
                        {isTeacher && (
                            <div className="mt-4 md:mt-0 text-left md:text-right">
                                <p className="text-sm font-medium text-muted-foreground">Join Code</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-lg font-mono font-bold text-primary tracking-widest p-2 bg-secondary rounded-md">{course.joinCode}</p>
                                    <Button size="icon" variant="ghost" onClick={copyJoinCode}>
                                        <Copy className="h-5 w-5"/>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                     {isTeacher && (
                        <div className="flex items-center text-muted-foreground mt-4 pt-4 border-t">
                            <Users className="mr-2 h-4 w-4" />
                            <span>{enrolledStudents?.length || 0} Students Enrolled</span>
                        </div>
                    )}
                </div>

                {isTeacher ? (
                    <StudentPerformanceTable courseId={courseId} />
                ) : (
                    <StudentProgressView />
                )}
            </div>
        </AppShell>
    );
}
