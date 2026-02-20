import AuthGuard from '@/app/components/AuthGuard';
import AddTransaction from '@/app/components/AddTransaction';

export default function NewTransactionPage() {
  return (
    <AuthGuard>
      <AddTransaction />
    </AuthGuard>
  );
}
