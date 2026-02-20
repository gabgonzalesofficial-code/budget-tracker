'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import Icon from '@/app/components/Icon';
import { listAllDebts, payDebt } from '@/lib/queries/debts';
import { useCurrency } from '@/context/CurrencyContext';
import type { Debt } from '@/lib/types';

export default function PayDebtForm() {
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('debt');

  const [debts, setDebts] = useState<Debt[]>([]);
  const [debtId, setDebtId] = useState(preselectedId ?? '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listAllDebts().then(setDebts).catch(() => setDebts([]));
  }, []);

  useEffect(() => {
    if (preselectedId && debts.length > 0 && !debtId) {
      setDebtId(preselectedId);
    }
  }, [preselectedId, debts, debtId]);

  const activeDebts = debts.filter((d) => d.remaining_balance > 0);
  const selectedDebt = activeDebts.find((d) => d.id === debtId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Enter a valid amount');
      setIsSubmitting(false);
      return;
    }
    if (!debtId) {
      setError('Select a debt');
      setIsSubmitting(false);
      return;
    }

    try {
      await payDebt(debtId, amt, date, notes || null);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setIsSubmitting(false);
    }
  };

  if (activeDebts.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FB]">
        <header className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link
                href="/debts"
                className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </Link>
            </div>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-[#6B7280]">
            {debts.length === 0
              ? 'No debts to pay. Add a debt first.'
              : 'All debts paid off! Add a new debt to track.'}
          </p>
          <Link href="/debts/new" className="mt-4 inline-block text-[#059669] font-medium">
            Add Debt →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/debts"
              className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Debts</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1F2937] mb-2">Pay Debt</h1>
          <p className="text-[#6B7280]">Record a payment to reduce your balance</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E5E7EB]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-[#FEE2E2] rounded-xl text-sm text-[#991B1B]">{error}</div>
            )}

            <div>
              <label htmlFor="debt" className="block text-sm font-medium text-[#374151] mb-2">
                Debt
              </label>
              <select
                id="debt"
                value={debtId}
                onChange={(e) => setDebtId(e.target.value)}
                className="w-full px-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent appearance-none bg-white"
                required
              >
                <option value="">Select a debt</option>
                {activeDebts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {formatAmount(d.remaining_balance)} remaining
                  </option>
                ))}
              </select>
              {selectedDebt && (
                <p className="mt-2 text-sm text-[#6B7280]">
                  Max payment: {formatAmount(selectedDebt.remaining_balance)}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-[#374151] mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icon name="wallet" size={20} /></span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedDebt?.remaining_balance ?? undefined}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-2xl font-semibold"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-[#374151] mb-2">
                Date
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icon name="calendar" size={20} /></span>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-[#374151] mb-2">
                Notes (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4"><FileText className="w-5 h-5 text-[#9CA3AF]" /></span>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent resize-none"
                  placeholder="e.g. Extra payment from bonus"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                href="/debts"
                className="flex-1 py-4 border-2 border-[#E5E7EB] text-[#6B7280] rounded-2xl font-medium hover:bg-[#F9FAFB] transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 bg-[#10B981] text-white rounded-2xl font-medium hover:bg-[#059669] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 p-4 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0]">
          <p className="text-sm text-[#166534]">
            Payments appear in your transaction history and reduce the debt balance. They are not counted as regular expenses.
          </p>
        </div>
      </div>
    </div>
  );
}
