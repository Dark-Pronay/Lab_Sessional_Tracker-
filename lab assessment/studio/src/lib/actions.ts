// Developer 1: Authentication Actions
// Core authentication and user management functions

import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { AppUser, Course, Enrollment } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function getUserProfile(firestore: Firestore, uid: string): Promise<AppUser | null> {
  const userRef = doc(firestore, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  return {
    uid,
    ...userSnap.data()
  } as AppUser;
}

export async function updateUserProfile(firestore: Firestore, uid: string, profileData: Partial<AppUser>) {
  const userRef = doc(firestore, 'users', uid);
  
  await updateDoc(userRef, profileData)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: profileData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw error;
    });
}

export async function createUserProfile(firestore: Firestore, uid: string, profileData: Omit<AppUser, 'uid'>) {
  const userRef = doc(firestore, 'users', uid);
  
  await setDoc(userRef, profileData)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'create',
        requestResourceData: profileData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw error;
    });
}

// Developer 2: Course Management Actions
// Course creation, enrollment, and management functions

export async function createCourseAction(
  firestore: Firestore,
  user: AppUser,
  values: { name: string; courseCode: string; credit: number }
) {
  if (!user || user.role !== 'teacher') {
    throw new Error('You must be a teacher to create a course.');
  }

  const { name, courseCode, credit } = values;
  const batch = writeBatch(firestore);

  // 1. Create the course document
  const courseRef = doc(collection(firestore, 'courses'));
  const joinCode =
    'JOIN' +
    courseCode.toUpperCase() +
    Math.random().toString(36).substring(2, 5).toUpperCase();

  const newCourse: Omit<Course, 'id'> = {
    courseName: name,
    courseCode,
    teacherId: user.uid,
    teacherName: user.fullName || 'N/A',
    joinCode: joinCode,
    credit: credit,
  };
  batch.set(courseRef, newCourse);

  // 2. Create the join code document
  const joinCodeRef = doc(firestore, 'courseJoinCodes', joinCode);
  const joinCodeData = {
    courseId: courseRef.id,
    teacherId: user.uid,
  };
  batch.set(joinCodeRef, joinCodeData);

  await batch.commit().catch((error) => {
    const permissionError = new FirestorePermissionError({
        path: courseRef.path,
        operation: 'create',
        requestResourceData: newCourse,
      });
    errorEmitter.emit('permission-error', permissionError);
    throw error;
  });

  return { ...newCourse, id: courseRef.id };
}

export async function joinCourseAction(
  firestore: Firestore,
  user: AppUser,
  values: { joinCode: string }
) {
  if (!user || user.role !== 'student') {
    throw new Error('You must be a student to join a course.');
  }

  const { joinCode } = values;

  // 1. Look up the join code
  const joinCodeRef = doc(firestore, 'courseJoinCodes', joinCode);
  const joinCodeSnap = await getDoc(joinCodeRef);

  if (!joinCodeSnap.exists()) {
    throw new Error('Invalid join code. Please try again.');
  }

  const { courseId, teacherId } = joinCodeSnap.data();

  // 2. Check if already enrolled
  const enrollmentsQuery = query(
    collection(firestore, 'enrollments'),
    where('studentId', '==', user.uid),
    where('courseId', '==', courseId)
  );
  const existingEnrollmentSnap = await getDocs(enrollmentsQuery);
  if (!existingEnrollmentSnap.empty) {
    const courseSnap = await getDoc(doc(firestore, 'courses', courseId));
    throw new Error(`You are already enrolled in ${courseSnap.data()?.courseName}.`);
  }

  // 3. Create the enrollment
  const enrollmentData: Omit<Enrollment, 'id' | 'finalGrade' | 'totalMarks'> = {
    studentId: user.uid,
    studentName: user.fullName || 'Unknown',
    studentEmail: user.email || 'Unknown',
    studentSchoolId: user.schoolId,
    courseId,
    teacherId,
    enrollmentDate: serverTimestamp(),
  };
  const enrollmentsCol = collection(firestore, 'enrollments');
  await addDoc(enrollmentsCol, enrollmentData)
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: enrollmentsCol.path,
            operation: 'create',
            requestResourceData: enrollmentData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    });

   const courseSnap = await getDoc(doc(firestore, 'courses', courseId));
   return courseSnap.data() as Course;
}

export async function getCoursesByTeacher(firestore: Firestore, teacherId: string): Promise<Course[]> {
  const coursesQuery = query(
    collection(firestore, 'courses'),
    where('teacherId', '==', teacherId)
  );
  const coursesSnap = await getDocs(coursesQuery);
  
  return coursesSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Course));
}

export async function getEnrollmentsByStudent(firestore: Firestore, studentId: string): Promise<Enrollment[]> {
  const enrollmentsQuery = query(
    collection(firestore, 'enrollments'),
    where('studentId', '==', studentId)
  );
  const enrollmentsSnap = await getDocs(enrollmentsQuery);
  
  return enrollmentsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Enrollment));
}
