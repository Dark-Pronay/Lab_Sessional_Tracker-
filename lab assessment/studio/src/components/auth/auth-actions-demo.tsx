'use client';

import { useFirestore } from '@/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/actions';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function AuthActionsDemo() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const testGetProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const profile = await getUserProfile(firestore, user.uid);
      toast({
        title: 'Profile Retrieved',
        description: `Found profile for ${profile?.fullName || 'Unknown'}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to retrieve profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testUpdateProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateUserProfile(firestore, user.uid, {
        fullName: user.fullName + ' (Updated)',
      });
      toast({
        title: 'Profile Updated',
        description: 'Profile successfully updated',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-2">
      <Button onClick={testGetProfile} disabled={isLoading} size="sm">
        Test Get Profile
      </Button>
      <Button onClick={testUpdateProfile} disabled={isLoading} size="sm" variant="outline">
        Test Update Profile
      </Button>
    </div>
  );
}