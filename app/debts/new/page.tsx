import AuthGuard from '@/app/components/AuthGuard';
import AddDebtForm from '@/app/components/AddDebtForm';

export default function NewDebtPage() {
  return (
    <AuthGuard>
      <AddDebtForm />
    </AuthGuard>
  );
}
