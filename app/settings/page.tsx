import AuthGuard from '@/app/components/AuthGuard';
import SettingsContent from '@/app/components/SettingsContent';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
