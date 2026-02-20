import AuthGuard from '@/app/components/AuthGuard';
import AIAssistant from '@/app/components/AIAssistant';

export default function AIAssistantPage() {
  return (
    <AuthGuard>
      <AIAssistant />
    </AuthGuard>
  );
}
