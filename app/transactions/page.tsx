import AuthGuard from '@/app/components/AuthGuard';
import TransactionsList from '@/app/components/TransactionsList';

export default function TransactionsPage() {
  return (
    <AuthGuard>
      <TransactionsList />
    </AuthGuard>
  );
}
