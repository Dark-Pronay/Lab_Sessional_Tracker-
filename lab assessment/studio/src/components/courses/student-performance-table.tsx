'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Calculator } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { saveStudentPerformanceAction, calculateAndSaveFinalGradeAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Enrollment, Performance, Attendance } from '@/lib/types';

interface StudentPerformanceTableProps {
  courseId: string;
}

interface StudentData {
  enrollment: Enrollment;
  performances: Performance[];
  attendances: Attendance[];
}

export function StudentPerformanceTable({ courseId }: StudentPerformanceTableProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [performanceData, setPerformanceData] = useState<Record<string, {
    labMarks: number;
    quizScore: number;
    vivaScore: number;
    attendance: 'present' | 'absent' | 'unmarked';
  }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [calculatingGrades, setCalculatingGrades] = useState<Set<string>>(new Set());

  const enrollmentsQuery = useMemoFirebase(() => {
    if (!courseId) return null;
    return query(collection(firestore, 'enrollments'), where('courseId', '==', courseId));
  }, [firestore, courseId]);

  const { data: enrollments, isLoading } = useCollection<Enrollment>(enrollmentsQuery);

  const handleInputChange = (enrollmentId: string, field: string, value: string | number) => {
    setPerformanceData(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value
      }
    }));
  };

  const handleSaveWeek = async () => {
    if (!selectedWeek) return;
    
    setIsSaving(true);
    try {
      const promises = Object.entries(performanceData).map(([enrollmentId, data]) => {
        if (!data) return Promise.resolve();
        
        return saveStudentPerformanceAction({
          enrollmentId,
          week: selectedWeek,
          status: data.attendance || 'unmarked',
          labMarks: data.labMarks || 0,
          quizScore: data.quizScore || 0,
          vivaScore: data.vivaScore || 0,
        });
      });

      await Promise.all(promises);
      
      toast({
        title: "Success",
        description: `Week ${selectedWeek} performance data saved successfully.`,
      });
      
      setPerformanceData({});
    } catch (error) {
      console.error('Error saving performance data:', error);
      toast({
        title: "Error",
        description: "Failed to save performance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCalculateGrade = async (enrollmentId: string) => {
    setCalculatingGrades(prev => new Set(prev).add(enrollmentId));
    
    try {
      await calculateAndSaveFinalGradeAction(enrollmentId);
      toast({
        title: "Success",
        description: "Final grade calculated successfully.",
      });
    } catch (error) {
      console.error('Error calculating grade:', error);
      toast({
        title: "Error",
        description: "Failed to calculate final grade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCalculatingGrades(prev => {
        const newSet = new Set(prev);
        newSet.delete(enrollmentId);
        return newSet;
      });
    }
  };

  if (isLoading) {
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
          <p className="text-muted-foreground">No students enrolled in this course yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="week-select">Week:</Label>
              <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
                    <SelectItem key={week} value={week.toString()}>
                      {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveWeek} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Week {selectedWeek}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Lab Marks</TableHead>
                  <TableHead>Quiz Score</TableHead>
                  <TableHead>Viva Score</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Final Grade</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{enrollment.studentName}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.studentEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={performanceData[enrollment.id]?.labMarks || ''}
                        onChange={(e) => handleInputChange(enrollment.id, 'labMarks', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="15"
                        placeholder="0"
                        value={performanceData[enrollment.id]?.quizScore || ''}
                        onChange={(e) => handleInputChange(enrollment.id, 'quizScore', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="15"
                        placeholder="0"
                        value={performanceData[enrollment.id]?.vivaScore || ''}
                        onChange={(e) => handleInputChange(enrollment.id, 'vivaScore', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={performanceData[enrollment.id]?.attendance || 'unmarked'}
                        onValueChange={(value) => handleInputChange(enrollment.id, 'attendance', value)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="unmarked">Unmarked</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {enrollment.finalGrade ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{enrollment.finalGrade}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {enrollment.totalMarks}/100
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not calculated</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCalculateGrade(enrollment.id)}
                        disabled={calculatingGrades.has(enrollment.id)}
                      >
                        {calculatingGrades.has(enrollment.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Calculator className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}