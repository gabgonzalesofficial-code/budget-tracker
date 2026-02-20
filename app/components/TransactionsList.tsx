'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Icon from '@/app/components/Icon';
import { formatAmount } from '@/lib/currency';
import { listTransactions } from '@/lib/queries/transactions';
import EmptyState from './EmptyState';
import type { Transaction } from '@/lib/types';

export default function TransactionsList() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    listTransactions({ limit: 100 })
      .then(setTransactions)
      .catch(() => setTransactions([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <Link
              href="/transactions/new"
              className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-xl font-medium hover:bg-[#4F46E5] transition-colors"
            >
              <Icon name="add" size={20} />
              Add Transaction
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1F2937] mb-2">Transactions</h1>
          <p className="text-[#6B7280]">View and manage all your financial activity</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB]">
          {transactions.length === 0 ? (
            <EmptyState
              iconName="wallet"
              title="No transactions yet"
              description="Start tracking your finances by adding your first transaction. Income, expenses, and other revenue are all supported."
              actionLabel="Add Transaction"
              onAction={() => router.push('/transactions/new')}
            />
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        t.type === 'income' || t.type === 'other_revenue' ? 'bg-[#D1FAE5]' : 'bg-[#F3F4F6]'
                      }`}
                    >
                      {t.type === 'income' || t.type === 'other_revenue' ? (
                        <Icon name="income" size={24} />
                      ) : t.type === 'debt_payment' ? (
                        <Icon name="debt" size={24} />
                      ) : (
                        <Icon name="expense" size={24} />
                      )}
                    </div>
                        <div>
                          <div className="font-medium text-[#1F2937]">
                            {t.type === 'debt_payment'
                              ? ((t.debt as { name?: string })?.name ?? t.description ?? 'Debt Payment')
                              : (t.description || 'Transaction')}
                          </div>
                          <div className="text-sm text-[#6B7280]">
                            {t.type === 'debt_payment' ? 'Debt Payment' : (t.category as { name?: string })?.name ?? t.type} · {t.date}
                          </div>
                        </div>
                  </div>
                  <div
                    className={`text-lg font-semibold ${t.type === 'income' || t.type === 'other_revenue' ? 'text-[#10B981]' : 'text-[#1F2937]'}`}
                  >
                    {t.type === 'expense' || t.type === 'debt_payment' ? '-' : '+'}{formatAmount(Math.abs(Number(t.amount)))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
