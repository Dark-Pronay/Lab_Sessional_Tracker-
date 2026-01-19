'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { Performance, Attendance, Enrollment } from '@/lib/types';

const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--chart-1))'];

interface StudentPerformanceGraphProps {
  enrollmentId: string;
}

export function StudentPerformanceGraph({
  enrollmentId,
}: StudentPerformanceGraphProps) {
  const firestore = useFirestore();

  const enrollmentRef = useMemoFirebase(() => {
      if (!enrollmentId) return null;
      return doc(firestore, 'enrollments', enrollmentId);
  }, [firestore, enrollmentId]);
  const { data: enrollment, isLoading: isLoadingEnrollment } = useDoc<Enrollment>(enrollmentRef);

  const performanceQuery = useMemoFirebase(() => {
    if (!enrollmentId) return null;
    return collection(firestore, 'enrollments', enrollmentId, 'performance');
  }, [firestore, enrollmentId]);
  const { data: performanceData, isLoading: isLoadingPerformance } =
    useCollection<Performance>(performanceQuery);

  const attendanceQuery = useMemoFirebase(() => {
    if (!enrollmentId) return null;
    return collection(firestore, 'enrollments', enrollmentId, 'attendance');
  }, [firestore, enrollmentId]);
  const { data: attendanceRecords, isLoading: isLoadingAttendance } =
    useCollection<Attendance>(attendanceQuery);

  const isLoading = isLoadingEnrollment || isLoadingPerformance || isLoadingAttendance;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const formattedPerformanceData =
    performanceData
      ?.map((p) => ({
        week: `Week ${p.week}`,
        lab: p.labMarks,
        quiz: p.quizScore,
        viva: p.vivaScore,
      }))
      .sort(
        (a, b) =>
          parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1])
      ) || [];

  const presentCount =
    attendanceRecords?.filter((a) => a.status === 'present').length || 0;
  const absentCount =
    attendanceRecords?.filter((a) => a.status === 'absent').length || 0;
  const totalAttended = presentCount + absentCount;
  const attendancePercentage =
    totalAttended > 0 ? (presentCount / totalAttended) * 100 : 0;

  const attendanceChartData = [
    { name: 'Present', value: presentCount },
    { name: 'Absent', value: absentCount },
  ].filter((d) => d.value > 0);

  const finalGrade = enrollment?.finalGrade ? {
      grade: enrollment.finalGrade,
      totalMarks: enrollment.totalMarks,
  } : null;


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Final Grade</CardTitle>
                <CardDescription>The calculated final grade for this student.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                {finalGrade ? (
                <>
                    <p className="text-8xl font-bold text-primary">{finalGrade.grade}</p>
                    <p className="text-2xl font-semibold">{finalGrade.totalMarks}/100</p>
                    <p className="text-xs text-muted-foreground mt-2">Calculated with AI</p>
                </>
                ) : (
                <p className="text-muted-foreground py-10">A final grade has not been calculated yet.</p>
                )}
            </CardContent>
        </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Overall Attendance</CardTitle>
          <CardDescription>
            {totalAttended > 0
              ? `${presentCount}/${totalAttended} weeks attended`
              : 'No attendance data available.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalAttended > 0 ? (
            <>
              <Progress value={attendancePercentage} className="mb-4 h-4" />
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {attendanceChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No attendance data recorded.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Weekly Score Breakdown
          </CardTitle>
          <CardDescription>
            Scores for labs, quizzes, and vivas each week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formattedPerformanceData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="lab"
                    name="Lab Marks"
                    stackId="a"
                    fill="hsl(var(--chart-1))"
                  />
                  <Bar
                    dataKey="quiz"
                    name="Quiz Score"
                    stackId="a"
                    fill="hsl(var(--chart-2))"
                  />
                  <Bar
                    dataKey="viva"
                    name="Viva Score"
                    stackId="a"
                    fill="hsl(var(--chart-3))"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No performance data recorded for this student yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}