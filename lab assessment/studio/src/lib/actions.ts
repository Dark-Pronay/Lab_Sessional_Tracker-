// Developer 1: Authentication Actions
// Core authentication and user management functions

import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { AppUser } from './types';
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
