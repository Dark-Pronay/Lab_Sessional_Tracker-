'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentPerformanceGraph } from '@/components/courses/student-performance-graph';
import { StudentPerformanceTable } from '@/components/courses/student-performance-table';
import { StudentProgressView } from '@/components/courses/student-progress-view';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function AnalyticsTestPage() {
  const [testEnrollmentId] = useState('test-enrollment-123');
  const [testCourseId] = useState('test-course-456');
  const [testStudentId] = useState('test-student-789');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Integration Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page tests the integration of analytics components from the analytics-3 branch.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Performance Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentPerformanceGraph enrollmentId={testEnrollmentId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Performance Table</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentPerformanceTable courseId={testCourseId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Progress View</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentProgressView studentId={testStudentId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Features Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Chatbot</h3>
              <p className="text-sm text-muted-foreground">
                Available globally via floating button
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Grade Calculator</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered grade calculation integrated
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}