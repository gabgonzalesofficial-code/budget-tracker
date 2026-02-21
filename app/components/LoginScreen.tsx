'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/app/components/Icon';
import { createClient } from '@/lib/supabase/client';

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : '';
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setForgotPasswordSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSignUpSuccess(false);
    const supabase = createClient();

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setSignUpSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] to-[#E8EDF4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-30 h-30 bg-[#FFFFF] rounded-2xl mb-4 overflow-hidden">
              <Icon name="logowithtext" size={100} />
          </Link>
          <h1 className="text-3xl font-semibold text-[#1F2937] mb-2">
            {isSignUp ? 'Start Your Journey' : 'Welcome Back'}
          </h1>
          <p className="text-[#6B7280]">
            {isSignUp
              ? 'Take control of your finances with AI-powered insights'
              : 'Your personal budget tracker with AI insights'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          {signUpSuccess ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto bg-[#D1FAE5] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#1F2937] mb-2">Account created successfully!</h2>
                <p className="text-[#6B7280] text-sm leading-relaxed">
                  We&apos;ve sent a verification link to <strong className="text-[#374151]">{email}</strong>.
                  Please check your inbox and click the link to verify your account.
                </p>
                <p className="text-[#6B7280] text-sm mt-3">
                  Once verified, you can sign in to start tracking your budget.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setSignUpSuccess(false); setIsSignUp(false); setError(null); }}
                className="w-full bg-[#059669] text-white py-3 rounded-xl font-medium hover:bg-[#047857] transition-colors shadow-sm"
              >
                Go to Sign In
              </button>
              <p className="text-xs text-[#9CA3AF]">
                Didn&apos;t receive the email? Check your spam folder.
              </p>
            </div>
          ) : showForgotPassword ? (
            forgotPasswordSuccess ? (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 mx-auto bg-[#D1FAE5] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#1F2937] mb-2">Check your email</h2>
                  <p className="text-[#6B7280] text-sm leading-relaxed">
                    We&apos;ve sent a password reset link to <strong className="text-[#374151]">{email}</strong>.
                    Click the link to set a new password.
                  </p>
                  <p className="text-[#6B7280] text-sm mt-3">
                    Didn&apos;t receive it? Check your spam folder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setForgotPasswordSuccess(false); setShowForgotPassword(false); setError(null); }}
                  className="w-full bg-[#059669] text-white py-3 rounded-xl font-medium hover:bg-[#047857] transition-colors shadow-sm"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-[#1F2937] mb-2">Reset password</h2>
                <p className="text-[#6B7280] text-sm mb-5">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  {error && (
                    <div className="p-3 bg-[#FEE2E2] rounded-xl text-sm text-[#991B1B]">
                      {error}
                    </div>
                  )}
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-[#374151] mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icon name="email" size={20} /></span>
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#059669] text-white py-3 rounded-xl font-medium hover:bg-[#047857] transition-colors shadow-sm"
                  >
                    Send reset link
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setError(null); }}
                  className="w-full text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors"
                >
                  ← Back to sign in
                </button>
              </>
            )
          ) : (
          <>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-[#FEE2E2] rounded-xl text-sm text-[#991B1B]">
                {error}
              </div>
            )}
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#374151] mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icon name="email" size={20} /></span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icon name="password" size={20} /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-[#059669] border-[#D1D5DB] rounded focus:ring-[#059669]" />
                  <span className="ml-2 text-[#6B7280]">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setError(null); }}
                  className="text-[#059669] font-medium hover:text-[#047857] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#059669] text-white py-3 rounded-xl font-medium hover:bg-[#047857] transition-colors shadow-sm"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setSignUpSuccess(false); }}
              className="text-sm text-[#6B7280]"
            >
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <span className="text-[#059669] font-medium hover:text-[#047857] transition-colors">
                    Sign in
                  </span>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <span className="text-[#059669] font-medium hover:text-[#047857] transition-colors">
                    Sign up
                  </span>
                </>
              )}
            </button>
          </div>
          </>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-[#9CA3AF]">
          <p>Your financial data is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}
