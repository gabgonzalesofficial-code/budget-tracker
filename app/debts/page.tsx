import AuthGuard from '@/app/components/AuthGuard';
import DebtsList from '@/app/components/DebtsList';

export default function DebtsPage() {
  return (
    <AuthGuard>
      <DebtsList />
    </AuthGuard>
  );
}
