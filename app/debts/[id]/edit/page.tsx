import AuthGuard from '@/app/components/AuthGuard';
import EditDebtForm from '@/app/components/EditDebtForm';

export default async function EditDebtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AuthGuard>
      <EditDebtForm id={id} />
    </AuthGuard>
  );
}
