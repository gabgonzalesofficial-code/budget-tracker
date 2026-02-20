import { Suspense } from 'react';
import LoginScreen from '@/app/components/LoginScreen';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">Loading...</div>}>
      <LoginScreen />
    </Suspense>
  );
}
