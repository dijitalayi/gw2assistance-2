"use client";

import { useAuth } from '@/core/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { apiKey, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !apiKey) {
      router.push('/login');
    }
  }, [apiKey, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f9fa] dark:bg-[#1a1b1e]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#eb5e28]"></div>
      </div>
    );
  }

  // Prevent flicker before redirect
  if (!apiKey) {
    return null; 
  }

  return <>{children}</>;
}
