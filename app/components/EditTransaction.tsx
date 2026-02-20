'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Repeat } from 'lucide-react';
import Icon from '@/app/components/Icon';
import { getCategories } from '@/lib/queries/categories';
import { getTransactionById, updateTransaction } from '@/lib/queries/transactions';
import { isSalaryCategory, getNextBiMonthlyPayDate } from '@/lib/salary';
import type { Category, TransactionType } from '@/lib/types';

export default function EditTransaction({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isSalary = isSalaryCategory(selectedCategory);
  const isDebtPayment = transactionType === 'debt_payment';

  useEffect(() => {
    getTransactionById(id)
      .then((tx) => {
        if (!tx) {
          setNotFound(true);
          return;
        }
        const type = tx.type as TransactionType;
        setTransactionType(type);
        setAmount(String(Math.abs(Number(tx.amount))));
        setCategoryId(tx.category_id);
        setDate(tx.date);
        setNotes(tx.notes ?? '');
        setDescription(tx.description ?? '');
        setRecurring(tx.recurring_schedule === 'bi-monthly');
        getCategories(type === 'debt_payment' ? 'income' : type).then(setCategories).catch(() => setCategories([]));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!loading && categoryId) {
      const catType = transactionType === 'debt_payment' ? 'income' : transactionType;
      getCategories(catType).then(setCategories).catch(() => setCategories([]));
    }
  }, [transactionType, loading, categoryId]);

  useEffect(() => {
    if (isSalary) setTransactionType('income');
  }, [isSalary, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount');
      setIsSubmitting(false);
      return;
    }

    try {
      await updateTransaction(id, {
        amount: Math.abs(amt),
        type: transactionType,
        category_id: categoryId,
        description: description || null,
        date,
        notes: notes || null,
        recurring_schedule: isSalary && recurring ? 'bi-monthly' : null,
      });
      router.push('/transactions');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-[#6B7280]">Loading...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center gap-4">
        <p className="text-[#6B7280]">Transaction not found</p>
        <Link href="/transactions" className="text-[#059669] hover:underline font-medium">
          Back to Transactions
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/transactions"
              className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Transactions</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1F2937] mb-2">Edit Transaction</h1>
          <p className="text-[#6B7280]">Update your transaction details</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E5E7EB]">
          <div className="mb-8">
            <label className="block text-sm font-medium text-[#374151] mb-4">Transaction Type</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                disabled={isSalary || isDebtPayment}
                onClick={() => {
                  setTransactionType('expense');
                  setCategoryId('');
                }}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isSalary || isDebtPayment ? 'opacity-50 cursor-not-allowed border-[#E5E7EB]' : ''
                } ${
                  transactionType === 'expense'
                    ? 'border-[#EF4444] bg-[#FEF2F2]'
                    : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transactionType === 'expense' ? 'bg-[#EF4444]' : 'bg-[#F3F4F6]'
                    }`}
                  >
                    <Icon name="expense" size={24} invert={transactionType === 'expense'} />
                  </div>
                  <span className={`font-medium ${transactionType === 'expense' ? 'text-[#EF4444]' : 'text-[#6B7280]'}`}>
                    Expense
                  </span>
                </div>
              </button>

              <button
                type="button"
                disabled={isDebtPayment}
                onClick={() => {
                  setTransactionType('income');
                  setCategoryId('');
                }}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isDebtPayment ? 'opacity-50 cursor-not-allowed border-[#E5E7EB]' : ''
                } ${
                  transactionType === 'income'
                    ? 'border-[#10B981] bg-[#ECFDF5]'
                    : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transactionType === 'income' ? 'bg-[#10B981]' : 'bg-[#F3F4F6]'
                    }`}
                  >
                    <Icon name="income" size={24} invert={transactionType === 'income'} />
                  </div>
                  <span className={`font-medium ${transactionType === 'income' ? 'text-[#10B981]' : 'text-[#6B7280]'}`}>
                    Income
                  </span>
                </div>
              </button>

              <button
                type="button"
                disabled={isSalary || isDebtPayment}
                onClick={() => {
                  setTransactionType('other_revenue');
                  setCategoryId('');
                }}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isSalary || isDebtPayment ? 'opacity-50 cursor-not-allowed border-[#E5E7EB]' : ''
                } ${
                  transactionType === 'other_revenue'
                    ? 'border-[#059669] bg-[#D1FAE5]'
                    : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transactionType === 'other_revenue' ? 'bg-[#059669]' : 'bg-[#F3F4F6]'
                    }`}
                  >
                    <Icon name="add" size={24} invert={transactionType === 'other_revenue'} />
                  </div>
                  <span
                    className={`font-medium text-center ${transactionType === 'other_revenue' ? 'text-[#059669]' : 'text-[#6B7280]'}`}
                  >
                    Other Revenue
                  </span>
                </div>
              </button>
            </div>
            {isDebtPayment && (
              <p className="mt-2 text-sm text-[#6B7280]">Debt payment transactions cannot change type or category.</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-[#FEE2E2] rounded-xl text-sm text-[#991B1B]">{error}</div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#374151] mb-2">
                Description
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all"
                placeholder="e.g., Grocery Store, Salary"
                required
              />
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all text-2xl font-semibold"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#374151] mb-2">
                Category
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"><Icon name="budget" size={20} /></span>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={isDebtPayment}
                  className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all appearance-none bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {isSalary && (
                <p className="mt-2 text-sm text-[#6B7280]">Salary is automatically counted as income.</p>
              )}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-[#374151] mb-2">
                Date
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><Icon name="calendar" size={20} /></span>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all"
                  required
                />
              </div>
              {isSalary && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const d = getNextBiMonthlyPayDate(new Date(date));
                      setDate(d.toISOString().split('T')[0]);
                    }}
                    className="text-sm text-[#059669] hover:text-[#047857] font-medium"
                  >
                    Set to next pay date (15th or 30th)
                  </button>
                </div>
              )}
            </div>

            {isSalary && (
              <div className="flex items-center gap-3 p-4 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0]">
                <input
                  id="recurring"
                  type="checkbox"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="w-4 h-4 text-[#10B981] rounded focus:ring-[#10B981]"
                />
                <label htmlFor="recurring" className="flex items-center gap-2 text-sm text-[#166534] cursor-pointer">
                  <Repeat className="w-4 h-4" />
                  Mark as recurring (bi-monthly on 15th & 30th)
                </label>
              </div>
            )}

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
                  className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all resize-none"
                  placeholder="Add any additional details..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                href="/transactions"
                className="flex-1 py-4 border-2 border-[#E5E7EB] text-[#6B7280] rounded-2xl font-medium hover:bg-[#F9FAFB] transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 bg-[#059669] text-white rounded-2xl font-medium hover:bg-[#047857] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
