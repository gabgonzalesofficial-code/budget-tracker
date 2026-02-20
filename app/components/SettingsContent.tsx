'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, User, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCurrency } from '@/context/CurrencyContext';
import { CURRENCIES, type CurrencyCode } from '@/lib/currencies';

export default function SettingsContent() {
  const router = useRouter();
  const { currencyCode, setCurrency } = useCurrency();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setFullName(user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '');
        setEmail(user.email ?? '');
      }
    });
  }, []);

  const handleSaveCurrency = async (code: CurrencyCode) => {
    setSaving('currency');
    setMessage(null);
    try {
      await setCurrency(code);
      setMessage({ type: 'success', text: 'Currency updated successfully.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update currency.' });
    } finally {
      setSaving(null);
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving('name');
    setMessage(null);
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });
      setMessage({ type: 'success', text: 'Name updated successfully.' });
      router.refresh();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update name.' });
    } finally {
      setSaving(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setSaving('password');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update password.',
      });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-[#1F2937] mb-2">Settings</h1>
        <p className="text-[#6B7280] mb-8">Manage your account and preferences</p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl ${
              message.type === 'success' ? 'bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534]' : 'bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {/* Currency */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#D1FAE5] rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#059669]" />
              </div>
              <div>
                <h2 className="font-semibold text-[#1F2937]">Currency</h2>
                <p className="text-sm text-[#6B7280]">Choose how amounts are displayed</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSaveCurrency(code)}
                  disabled={saving === 'currency'}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currencyCode === code
                      ? 'bg-[#059669] text-white'
                      : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                  } disabled:opacity-60`}
                >
                  {CURRENCIES[code].symbol} {code}
                </button>
              ))}
            </div>
          </section>

          {/* Profile - Name */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#D1FAE5] rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-[#059669]" />
              </div>
              <div>
                <h2 className="font-semibold text-[#1F2937]">Profile</h2>
                <p className="text-sm text-[#6B7280]">Update your display name</p>
              </div>
            </div>
            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#374151] mb-2">
                  Display name
                </label>
                <input
                  id="name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">Email</label>
                <p className="text-sm text-[#374151]">{email}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Email cannot be changed here.</p>
              </div>
              <button
                type="submit"
                disabled={saving === 'name'}
                className="px-6 py-2 bg-[#059669] text-white rounded-xl font-medium hover:bg-[#047857] disabled:opacity-60"
              >
                {saving === 'name' ? 'Saving...' : 'Save name'}
              </button>
            </form>
          </section>

          {/* Password */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#D1FAE5] rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#059669]" />
              </div>
              <div>
                <h2 className="font-semibold text-[#1F2937]">Change password</h2>
                <p className="text-sm text-[#6B7280]">Set a new password for your account</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-[#374151] mb-2">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  placeholder="At least 6 characters"
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#374151] mb-2">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  placeholder="Repeat new password"
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={saving === 'password' || !newPassword || !confirmPassword}
                className="px-6 py-2 bg-[#059669] text-white rounded-xl font-medium hover:bg-[#047857] disabled:opacity-60"
              >
                {saving === 'password' ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
