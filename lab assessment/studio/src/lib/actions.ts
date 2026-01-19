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
import type { AppUser, Course, Enrollment, Performance, Attendance, PerformanceAnalytics } from './types';
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

// Developer 3: Analytics & AI Actions
// Performance tracking, analytics, and AI-powered grade calculation

export async function saveStudentPerformanceAction(
  { enrollmentId, week, status, labMarks, quizScore, vivaScore }: {
    enrollmentId: string,
    week: number,
    status: 'present' | 'absent' | 'unmarked',
    labMarks: number,
    quizScore: number,
    vivaScore: number
  }
) {
  const firestore = (await import('@/firebase')).getSdks((await import('firebase/app')).getApp()).firestore;
  const batch = writeBatch(firestore);

  // 1. Handle Attendance
  if (status !== 'unmarked') {
    const attendanceCol = collection(firestore, 'enrollments', enrollmentId, 'attendance');
    const attendanceQuery = query(attendanceCol, where('week', '==', week));
    const attendanceSnap = await getDocs(attendanceQuery);
    const attendanceData = { week, status, date: serverTimestamp(), enrollmentId };
    
    if (attendanceSnap.empty) {
      const attendanceRef = doc(attendanceCol);
      batch.set(attendanceRef, attendanceData);
    } else {
      batch.update(attendanceSnap.docs[0].ref, attendanceData);
    }
  }

  // 2. Handle Performance
  const performanceCol = collection(firestore, 'enrollments', enrollmentId, 'performance');
  const performanceQuery = query(performanceCol, where('week', '==', week));
  const performanceSnap = await getDocs(performanceQuery);
  const performanceData = { week, labMarks, quizScore, vivaScore, enrollmentId };

  if (performanceSnap.empty) {
    const performanceRef = doc(performanceCol);
    batch.set(performanceRef, performanceData);
  } else {
    batch.update(performanceSnap.docs[0].ref, performanceData);
  }

  await batch.commit().catch((error) => {
    const permissionError = new FirestorePermissionError({
      path: `enrollments/${enrollmentId}/performance`,
      operation: 'write',
      requestResourceData: performanceData,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw error;
  });
}

export async function calculateAndSaveFinalGradeAction(enrollmentId: string) {
  const firestore = (await import('@/firebase')).getSdks((await import('firebase/app')).getApp()).firestore;

  const enrollmentRef = doc(firestore, 'enrollments', enrollmentId);
  const enrollmentSnap = await getDoc(enrollmentRef);
  if (!enrollmentSnap.exists()) {
    throw new Error(`Enrollment with ID ${enrollmentId} not found.`);
  }
  const enrollmentData = enrollmentSnap.data() as Enrollment;

  const courseRef = doc(firestore, 'courses', enrollmentData.courseId);
  const courseSnap = await getDoc(courseRef);
  if (!courseSnap.exists()) {
      throw new Error(`Course with ID ${enrollmentData.courseId} not found.`);
  }
  const courseData = courseSnap.data() as Partial<Course>;

  // 1. Fetch all performance and attendance for the enrollment
  const performanceQuery = collection(firestore, 'enrollments', enrollmentId, 'performance');
  const attendanceQuery = collection(firestore, 'enrollments', enrollmentId, 'attendance');
  
  const [performanceSnap, attendanceSnap] = await Promise.all([
    getDocs(performanceQuery),
    getDocs(attendanceQuery),
  ]);

  const performances = performanceSnap.docs.map(d => d.data() as Performance);
  const attendances = attendanceSnap.docs.map(d => d.data() as Attendance);

  if (performances.length === 0) {
    throw new Error("No performance data found for this student to calculate a grade.");
  }
  
  // 2. Aggregate raw scores
  const totalLabMarks = performances.reduce((sum, p) => sum + p.labMarks, 0);
  
  const week12Performance = performances.find(p => p.week === 12);
  const quizScore = week12Performance?.quizScore || 0;
  const vivaScore = week12Performance?.vivaScore || 0;

  const presentCount = attendances.filter(a => a.status === 'present').length;
  const totalAttendanceRecords = attendances.length || 1;
  const attendancePercentage = (presentCount / totalAttendanceRecords) * 100;

  // 3. Define max scores and weights from the new rubric
  const credit = courseData.credit ?? 1.5;
  const MAX_TOTAL_LAB_MARKS = credit * 100;
  const MAX_QUIZ_SCORE = 15;
  const MAX_VIVA_SCORE = 15;
  
  const WEIGHT_LAB = 0.60;
  const WEIGHT_QUIZ = 0.15;
  const WEIGHT_VIVA = 0.15;
  const WEIGHT_ATTENDANCE = 0.10;

  // 4. Calculate final percentage score
  const cappedLabMarks = Math.min(totalLabMarks, MAX_TOTAL_LAB_MARKS);
  const cappedQuizScore = Math.min(quizScore, MAX_QUIZ_SCORE);
  const cappedVivaScore = Math.min(vivaScore, MAX_VIVA_SCORE);

  const weightedLabScore = (cappedLabMarks / MAX_TOTAL_LAB_MARKS) * (100 * WEIGHT_LAB);
  const weightedQuizScore = (cappedQuizScore / MAX_QUIZ_SCORE) * (100 * WEIGHT_QUIZ);
  const weightedVivaScore = (cappedVivaScore / MAX_VIVA_SCORE) * (100 * WEIGHT_VIVA);
  const weightedAttendanceScore = (attendancePercentage / 100) * (100 * WEIGHT_ATTENDANCE);
  
  const totalPercentage = weightedLabScore + weightedQuizScore + weightedVivaScore + weightedAttendanceScore;

  // 5. Call AI flow to determine letter grade
  const { calculateFinalGrade } = await import('@/ai/flows/calculate-final-grade');
  const aiResult = await calculateFinalGrade({
    totalPercentage,
    weightedScores: {
        lab: weightedLabScore.toFixed(2),
        quiz: weightedQuizScore.toFixed(2),
        viva: weightedVivaScore.toFixed(2),
        attendance: weightedAttendanceScore.toFixed(2),
    },
    actualScores: {
        totalLabMarks: cappedLabMarks,
        quizScore: cappedQuizScore,
        vivaScore: cappedVivaScore,
        attendancePercentage: attendancePercentage.toFixed(2),
    },
    maxScores: {
        lab: MAX_TOTAL_LAB_MARKS,
        quiz: MAX_QUIZ_SCORE,
        viva: MAX_VIVA_SCORE,
    }
  });

  // 6. Save result to enrollment document
  const finalMarks = parseFloat(totalPercentage.toFixed(2));
  const updateData = {
      finalGrade: aiResult.finalGrade,
      totalMarks: finalMarks,
  };
  await updateDoc(enrollmentRef, updateData)
    .catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: enrollmentRef.path,
            operation: 'update',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    });

  return { ...aiResult, totalMarks: finalMarks };
}

export async function getPerformanceAnalytics(firestore: Firestore, enrollmentId: string): Promise<PerformanceAnalytics | null> {
  const performanceQuery = collection(firestore, 'enrollments', enrollmentId, 'performance');
  const attendanceQuery = collection(firestore, 'enrollments', enrollmentId, 'attendance');
  
  const [performanceSnap, attendanceSnap] = await Promise.all([
    getDocs(performanceQuery),
    getDocs(attendanceQuery),
  ]);

  const performances = performanceSnap.docs.map(d => d.data() as Performance);
  const attendances = attendanceSnap.docs.map(d => d.data() as Attendance);

  if (performances.length === 0) return null;

  const totalLabMarks = performances.reduce((sum, p) => sum + p.labMarks, 0);
  const week12Performance = performances.find(p => p.week === 12);
  const quizScore = week12Performance?.quizScore || 0;
  const vivaScore = week12Performance?.vivaScore || 0;

  const presentCount = attendances.filter(a => a.status === 'present').length;
  const attendancePercentage = attendances.length > 0 ? (presentCount / attendances.length) * 100 : 0;

  // Calculate weighted final percentage (simplified)
  const finalPercentage = (totalLabMarks * 0.6) + (quizScore * 0.15) + (vivaScore * 0.15) + (attendancePercentage * 0.1);

  return {
    totalLabMarks,
    quizScore,
    vivaScore,
    attendancePercentage,
    finalPercentage,
    letterGrade: finalPercentage >= 90 ? 'A' : finalPercentage >= 80 ? 'B' : finalPercentage >= 70 ? 'C' : 'F'
  };
}
