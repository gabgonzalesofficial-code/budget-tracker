import AuthGuard from '@/app/components/AuthGuard';
import EditTransaction from '@/app/components/EditTransaction';

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AuthGuard>
      <EditTransaction id={id} />
    </AuthGuard>
  );
}
