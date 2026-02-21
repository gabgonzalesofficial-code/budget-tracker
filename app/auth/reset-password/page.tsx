'use client';

import { Suspense } from 'react';
import ResetPasswordScreen from '@/app/components/ResetPasswordScreen';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">Loading...</div>}>
      <ResetPasswordScreen />
    </Suspense>
  );
}
