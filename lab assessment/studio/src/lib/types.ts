// Developer 1: Authentication & UI Foundation Types
// Core user and authentication types

export type UserRole = 'teacher' | 'student';

export interface AppUser {
  uid: string;
  email: string | null;
  fullName: string | null;
  role: UserRole | 'no-profile';
  schoolId: string;
}

// Developer 2's Course Management Types
export interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  teacherId: string;
  joinCode: string;
  teacherName?: string;
  credit: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  teacherId: string;
  studentSchoolId?: string;
  enrollmentDate: any; // Can be Date or FieldValue
  finalGrade?: string;
  totalMarks?: number;
}

export interface CourseJoinCode {
  courseId: string;
  teacherId: string;
}

// Developer 3's Performance & Analytics Types
export interface Attendance {
  id: string;
  enrollmentId: string;
  week: number;
  date: string;
  status: 'present' | 'absent';
}

export interface Performance {
  id: string;
  enrollmentId: string;
  week: number;
  labMarks: number;
  quizScore: number;
  vivaScore: number;
}

export interface FinalGrade {
  id: string;
  enrollmentId: string;
  finalGrade: string;
  totalMarks: number;
  calculatedAt: Date;
}

export interface PerformanceAnalytics {
  totalLabMarks: number;
  quizScore: number;
  vivaScore: number;
  attendancePercentage: number;
  finalPercentage: number;
  letterGrade: string;
}

export interface WeeklyPerformance {
  week: number;
  labMarks: number;
  quizScore: number;
  vivaScore: number;
  attendance: 'present' | 'absent' | 'unmarked';
}

export interface GradingWeights {
  lab: number;
  quiz: number;
  viva: number;
  attendance: number;
}
