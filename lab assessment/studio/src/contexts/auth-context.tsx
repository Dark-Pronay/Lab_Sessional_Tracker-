'use client';

import type { AppUser, UserRole } from '@/lib/types';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  useUser as useFirebaseUser,
  useFirestore,
  useAuth as useFirebaseAuth,
  useMemoFirebase,
  useDoc,
} from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    fullName: string,
    email: string,
    password: string,
    role: UserRole,
    schoolId: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: firebaseUser, isUserLoading: isAuthLoading } = useFirebaseUser();
  const firestore = useFirestore();
  const auth = useFirebaseAuth();

  const userProfileRef = useMemoFirebase(() => {
    if (!firebaseUser) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firestore, firebaseUser]);

  const {
    data: userProfile,
    isLoading: isProfileLoading,
  } = useDoc<AppUser>(userProfileRef);

  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoading = isAuthLoading || (!!firebaseUser && isProfileLoading);
    setLoading(isLoading);
    if (!isLoading) {
      if (firebaseUser && userProfile) {
        setAppUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: userProfile.fullName,
            role: userProfile.role,
            schoolId: userProfile.schoolId,
        });
      } else if (firebaseUser && !userProfile) {
        // User is authenticated but has no profile document.
        setAppUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName,
          role: 'no-profile',
          schoolId: ''
        });
      }
      else {
        setAppUser(null);
      }
    }
  }, [firebaseUser, userProfile, isAuthLoading, isProfileLoading]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (
    fullName: string,
    email: string,
    password: string,
    role: UserRole,
    schoolId: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const userProfileData = {
      fullName,
      email,
      role,
      schoolId,
    };
    
    const userDocRef = doc(firestore, 'users', user.uid);
    // Create user profile in Firestore
    await setDoc(userDocRef, userProfileData)
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: userProfileData,
        });
        errorEmitter.emit('permission-error', permissionError);
        // Re-throw the original error to be caught by the form's try/catch
        throw serverError;
      });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = { user: appUser, loading, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
