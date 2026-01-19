'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Enrollment, Course } from '@/lib/types';

interface StudentProgressViewProps {
  studentId: string;
}

export function StudentProgressView({ studentId }: StudentProgressViewProps) {
  const firestore = useFirestore();

  const enrollmentsQuery = useMemoFirebase(() => {
    if (!studentId) return null;
    return query(collection(firestore, 'enrollments'), where('studentId', '==', studentId));
  }, [firestore, studentId]);

  const { data: enrollments, isLoading } = useCollection<Enrollment>(enrollmentsQuery);

  const coursesQuery = useMemoFirebase(() => {
    if (!enrollments || enrollments.length === 0) return null;
    const courseIds = enrollments.map(e => e.courseId);
    return query(collection(firestore, 'courses'), where('__name__', 'in', courseIds));
  }, [firestore, enrollments]);

  const { data: courses, isLoading: isLoadingCourses } = useCollection<Course>(coursesQuery);

  if (isLoading || isLoadingCourses) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">You are not enrolled in any courses yet.</p>
        </CardContent>
      </Card>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'F': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getGradeIcon = (grade: string) => {
    if (['A', 'B'].includes(grade)) return <TrendingUp className="w-4 h-4" />;
    if (grade === 'C') return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const coursesMap = courses?.reduce((acc, course) => {
    acc[course.id] = course;
    return acc;
  }, {} as Record<string, Course>) || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => {
              const course = coursesMap[enrollment.courseId];
              if (!course) return null;

              return (
                <Card key={enrollment.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{course.courseName}</CardTitle>
                      {enrollment.finalGrade && (
                        <div className="flex items-center gap-1">
                          {getGradeIcon(enrollment.finalGrade)}
                          <Badge className={`${getGradeColor(enrollment.finalGrade)} text-white`}>
                            {enrollment.finalGrade}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{course.courseCode}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {enrollment.totalMarks !== undefined ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Overall Score</span>
                            <span className="font-medium">{enrollment.totalMarks}/100</span>
                          </div>
                          <Progress value={enrollment.totalMarks} className="h-2" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Credit: {course.credit} | Teacher: {course.teacherName}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          Grade not calculated yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {enrollments.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {enrollments.filter(e => e.finalGrade && ['A', 'B'].includes(e.finalGrade)).length}
              </p>
              <p className="text-sm text-muted-foreground">High Grades (A-B)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {enrollments.filter(e => e.totalMarks).length > 0 
                  ? Math.round(enrollments.filter(e => e.totalMarks).reduce((sum, e) => sum + (e.totalMarks || 0), 0) / enrollments.filter(e => e.totalMarks).length)
                  : 0}
              </p>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}