import { Suspense } from 'react';
import AuthGuard from '@/app/components/AuthGuard';
import PayDebtForm from '@/app/components/PayDebtForm';

export default function PayDebtPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">Loading...</div>}>
        <PayDebtForm />
      </Suspense>
    </AuthGuard>
  );
}
