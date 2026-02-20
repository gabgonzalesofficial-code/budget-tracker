'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Percent } from 'lucide-react';
import Icon from '@/app/components/Icon';
import { createDebt } from '@/lib/queries/debts';
import { formatAmount } from '@/lib/currency';
import type { DebtType } from '@/lib/types';

export default function AddDebtForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<DebtType>('personal');
  const [totalAmount, setTotalAmount] = useState('');
  const [remainingBalance, setRemainingBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const total = parseFloat(totalAmount);
    const remaining = parseFloat(remainingBalance);
    if (isNaN(total) || total < 0 || isNaN(remaining) || remaining < 0) {
      setError('Enter valid amounts');
      return;
    }
    if (remaining > total) {
      setError('Remaining balance cannot exceed total amount');
      return;
    }

    try {
      await createDebt({
        name,
        type,
        total_amount: total,
        remaining_balance: remaining,
        interest_rate: interestRate ? parseFloat(interestRate) : null,
        due_date: dueDate || null,
      });
      router.push('/debts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add debt');
    }
  };

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
          <h1 className="text-2xl font-semibold text-[#1F2937] mb-2">Add Debt</h1>
          <p className="text-[#6B7280]">Track loans, credit cards, and personal debt</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E5E7EB]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-[#FEE2E2] rounded-xl text-sm text-[#991B1B]">{error}</div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#374151] mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                placeholder="e.g. Credit Card, Personal Loan"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-[#374151] mb-2">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as DebtType)}
                className="w-full px-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent appearance-none bg-white"
              >
                <option value="loan">Loan</option>
                <option value="credit_card">Credit Card</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <div>
              <label htmlFor="total" className="block text-sm font-medium text-[#374151] mb-2">
                Total Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icon name="wallet" size={20} /></span>
                <input
                  id="total"
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="remaining" className="block text-sm font-medium text-[#374151] mb-2">
                Remaining Balance
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icon name="wallet" size={20} /></span>
                <input
                  id="remaining"
                  type="number"
                  step="0.01"
                  min="0"
                  value={remainingBalance}
                  onChange={(e) => setRemainingBalance(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-[#6B7280]">Leave equal to total if starting fresh</p>
            </div>

            <div>
              <label htmlFor="interest" className="block text-sm font-medium text-[#374151] mb-2">
                Interest Rate % (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2"><Percent className="w-5 h-5 text-[#9CA3AF]" /></span>
                <input
                  id="interest"
                  type="number"
                  step="0.01"
                  min="0"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                  placeholder="e.g. 12"
                />
              </div>
            </div>

            <div>
              <label htmlFor="due" className="block text-sm font-medium text-[#374151] mb-2">
                Due Date (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2"><Icon name="calendar" size={20} /></span>
                <input
                  id="due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
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
                className="flex-1 py-4 bg-[#6366F1] text-white rounded-2xl font-medium hover:bg-[#4F46E5] transition-colors"
              >
                Add Debt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
