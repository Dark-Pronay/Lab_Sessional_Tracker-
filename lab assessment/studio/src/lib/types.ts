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

// Basic course interface for auth context
export interface BasicCourse {
  id: string;
  courseName: string;
  courseCode: string;
  teacherId: string;
}

// Note: Extended course, enrollment, and performance types 
// will be added by Developer 2 and Developer 3
