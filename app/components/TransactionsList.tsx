'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import Icon from '@/app/components/Icon';
import { useCurrency } from '@/context/CurrencyContext';
import { listTransactions, deleteTransaction } from '@/lib/queries/transactions';
import EmptyState from './EmptyState';
import ConfirmModal from './ConfirmModal';
import type { Transaction } from '@/lib/types';

export default function TransactionsList() {
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    if (deletingId) return;
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await deleteTransaction(confirmDeleteId);
      setTransactions((prev) => prev.filter((t) => t.id !== confirmDeleteId));
      router.refresh();
      setConfirmDeleteId(null);
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

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
              className="flex items-center gap-2 px-4 py-2 bg-[#059669] text-white rounded-xl font-medium hover:bg-[#047857] transition-colors"
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
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-lg font-semibold ${t.type === 'income' || t.type === 'other_revenue' ? 'text-[#10B981]' : 'text-[#1F2937]'}`}
                    >
                      {t.type === 'expense' || t.type === 'debt_payment' ? '-' : '+'}{formatAmount(Math.abs(Number(t.amount)))}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/transactions/${t.id}/edit`}
                        className="p-2 text-[#6B7280] hover:text-[#059669] hover:bg-[#D1FAE5] rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(t.id)}
                        disabled={deletingId === t.id}
                        className="p-2 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete transaction"
        message="Are you sure you want to delete this transaction? This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loadingLabel="Deleting..."
        isLoading={deletingId !== null}
      />
    </div>
  );
}
