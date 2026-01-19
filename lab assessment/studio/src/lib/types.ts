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

// Note: Performance and Attendance types will be added by Developer 3
