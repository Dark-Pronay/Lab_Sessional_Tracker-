# **App Name**: LabTracker Pro

## Core Features:

- User Authentication: Firebase authentication supporting teacher and student roles.
- Course Management: Teachers can create lab courses with course codes and manage student join codes.
- Attendance Tracking: Teachers can mark weekly attendance for students (Present/Absent).
- Performance Evaluation: Teachers can input weekly lab marks, quiz, and viva scores.
- Automated Grade Calculation: Automatically calculate attendance percentage, total marks, and final grades using a LLM as a tool.
- Student Enrollment: Students can join courses using a join code.
- Progress Dashboard: Students can view their attendance history, marks, and final grades in a dashboard.
- Database Integration: Firestore database to store user data, course information, enrollments, attendance, and marks.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) to evoke a sense of professionalism and focus.
- Background color: Very light gray (#F5F5F5), close in hue to the primary.
- Accent color: Soft Lavender (#C5CAE9) to complement the primary, but with significantly lower saturation.
- Font pairing: 'Inter' for body text (sans-serif) and 'Literata' for headlines (serif).
- Use simple, clean icons from a library like Material Icons for course management and data visualization.
- Implement a responsive grid layout using Tailwind CSS for consistent spacing and alignment.
- Use subtle transitions and animations for feedback on user interactions, like button clicks and data loading.