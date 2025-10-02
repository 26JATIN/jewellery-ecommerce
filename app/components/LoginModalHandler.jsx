"use client";
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LoginModalHandler() {
  const searchParams = useSearchParams();
  const { triggerLoginModal, user } = useAuth();

  useEffect(() => {
    // Check if we need to show login modal
    const loginRequired = searchParams.get('login');
    const redirectPath = searchParams.get('redirect');
    
    if (loginRequired === 'required' && !user) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        triggerLoginModal();
      }, 500);
    }
  }, [searchParams, triggerLoginModal, user]);

  // This component doesn't render anything
  return null;
}