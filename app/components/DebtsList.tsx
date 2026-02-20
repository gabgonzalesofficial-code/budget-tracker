'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Icon from '@/app/components/Icon';
import { listAllDebts } from '@/lib/queries/debts';
import { formatAmount } from '@/lib/currency';
import type { Debt } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  loan: 'Loan',
  credit_card: 'Credit Card',
  personal: 'Personal',
};

export default function DebtsList() {
  const [debts, setDebts] = useState<Debt[]>([]);

  useEffect(() => {
    listAllDebts().then(setDebts).catch(() => setDebts([]));
  }, []);

  const totalRemaining = debts.reduce((s, d) => s + d.remaining_balance, 0);

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
            <div className="flex items-center gap-2">
              <Link
                href="/debts/pay"
                className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-xl font-medium hover:bg-[#059669] transition-colors"
              >
                <Icon name="wallet" size={16} />
                Pay Debt
              </Link>
              <Link
                href="/debts/new"
                className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-xl font-medium hover:bg-[#4F46E5] transition-colors"
              >
                <Icon name="add" size={16} />
                Add Debt
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1F2937] mb-2">Debts</h1>
          <p className="text-[#6B7280]">Track and pay down your debt</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] mb-6">
          <p className="text-sm text-[#6B7280] mb-1">Total remaining</p>
          <p className="text-3xl font-bold text-[#1F2937]">{formatAmount(totalRemaining)}</p>
        </div>

        {debts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-[#E5E7EB] text-center">
            <Icon name="debt" size={48} className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1F2937] mb-2">No debts yet</h3>
            <p className="text-[#6B7280] mb-6">Add a debt to start tracking payments and progress.</p>
            <Link
              href="/debts/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#6366F1] text-white rounded-xl font-medium hover:bg-[#4F46E5] transition-colors"
            >
              <Icon name="add" size={20} />
              Add Debt
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {debts.map((debt) => {
              const pct = debt.total_amount > 0
                ? ((debt.total_amount - debt.remaining_balance) / debt.total_amount) * 100
                : 0;
              const isPaidOff = debt.remaining_balance <= 0;

              return (
                <div
                  key={debt.id}
                  className={`bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] ${isPaidOff ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#FEE2E2] rounded-xl flex items-center justify-center">
                        <Icon name="debt" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1F2937]">{debt.name}</h3>
                        <p className="text-sm text-[#6B7280]">{TYPE_LABELS[debt.type] ?? debt.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#1F2937]">{formatAmount(debt.remaining_balance)}</p>
                      <p className="text-xs text-[#6B7280]">of {formatAmount(debt.total_amount)}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-[#F3F4F6] rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#6366F1] transition-all"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1">{pct.toFixed(0)}% paid</p>
                  </div>
                  {!isPaidOff && (
                    <Link
                      href={`/debts/pay?debt=${debt.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-medium hover:bg-[#059669] transition-colors"
                    >
                      <Icon name="wallet" size={16} />
                      Pay
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
