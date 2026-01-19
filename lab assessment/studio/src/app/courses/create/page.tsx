import { AppShell } from '@/components/app-shell';
import { CreateCourseForm } from '@/components/courses/create-course-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function CreateCoursePage() {
  return (
    <AppShell>
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create a New Course</CardTitle>
            <CardDescription>Fill out the details below to create a new lab course.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCourseForm />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
