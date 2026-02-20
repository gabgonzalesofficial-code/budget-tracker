import AuthGuard from '@/app/components/AuthGuard';
import BudgetManagement from '@/app/components/BudgetManagement';

export default function BudgetPage() {
  return (
    <AuthGuard>
      <BudgetManagement />
    </AuthGuard>
  );
}
