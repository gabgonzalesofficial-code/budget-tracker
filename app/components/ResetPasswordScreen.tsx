'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/app/components/Icon';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      }
      setSessionReady(true);
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setHasSession(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (sessionReady && !hasSession) {
      router.replace('/auth/login?message=reset_expired');
    }
  }, [sessionReady, hasSession, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] to-[#E8EDF4] flex items-center justify-center p-4">
        <div className="animate-pulse text-[#6B7280]">Loading...</div>
      </div>
    );
  }

  if (!hasSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] to-[#E8EDF4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-30 h-30 bg-[#FFFFF] rounded-2xl mb-4 overflow-hidden">
            <Icon name="logowithtext" size={100} />
          </Link>
          <h1 className="text-3xl font-semibold text-[#1F2937] mb-2">Set new password</h1>
          <p className="text-[#6B7280]">Choose a secure password for your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          {success ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto bg-[#D1FAE5] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#1F2937]">Password updated!</h2>
              <p className="text-[#6B7280] text-sm">Redirecting you to the dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-[#FEE2E2] rounded-xl text-sm text-[#991B1B]">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-[#374151] mb-2">
                  New password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icon name="password" size={20} /></span>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all"
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#374151] mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icon name="password" size={20} /></span>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all"
                    placeholder="Repeat your password"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#059669] text-white py-3 rounded-xl font-medium hover:bg-[#047857] transition-colors shadow-sm disabled:opacity-60"
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-sm text-[#6B7280] hover:text-[#059669] transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
