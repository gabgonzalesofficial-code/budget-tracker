'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon, { type IconName } from '@/app/components/Icon';
import { listDebts } from '@/lib/queries/debts';
import { formatAmount } from '@/lib/currency';
import type { Debt } from '@/lib/types';

export default function DebtOverview() {
  const [debts, setDebts] = useState<Debt[]>([]);

  useEffect(() => {
    listDebts().then(setDebts).catch(() => setDebts([]));
  }, []);

  const totalRemaining = debts.reduce((s, d) => s + d.remaining_balance, 0);

  if (debts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1F2937]">Debt Overview</h3>
          <Link
            href="/debts/new"
            className="text-sm text-[#6366F1] font-medium hover:text-[#4F46E5] transition-colors"
          >
            Add Debt
          </Link>
        </div>
        <p className="text-sm text-[#6B7280]">No active debts. Add a debt to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#1F2937]">Debt Overview</h3>
        <div className="flex items-center gap-3">
            <Link
              href="/debts/pay"
              className="text-sm text-[#10B981] font-medium hover:text-[#059669] transition-colors flex items-center gap-1"
            >
              <Icon name="wallet" size={16} />
            Pay Debt
          </Link>
            <Link
              href="/debts/new"
              className="text-sm text-[#6366F1] font-medium hover:text-[#4F46E5] transition-colors flex items-center gap-1"
            >
              <Icon name="add" size={16} />
            Add Debt
          </Link>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-2xl font-bold text-[#1F2937]">{formatAmount(totalRemaining)}</p>
        <p className="text-xs text-[#6B7280]">Total remaining</p>
      </div>
      <div className="space-y-4">
        {debts.slice(0, 3).map((debt) => {
          const pct = debt.total_amount > 0 ? ((debt.total_amount - debt.remaining_balance) / debt.total_amount) * 100 : 0;
          return (
            <Link
              key={debt.id}
              href={`/debts/pay?debt=${debt.id}`}
              className="block p-3 hover:bg-[#F9FAFB] rounded-xl transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name="debt" size={16} />
                  <span className="text-sm font-medium text-[#1F2937]">{debt.name}</span>
                </div>
                <span className="text-sm font-semibold text-[#1F2937]">{formatAmount(debt.remaining_balance)}</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#6366F1] transition-all"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
      {debts.length > 3 && (
        <Link
          href="/debts"
          className="block mt-3 text-sm text-[#6366F1] font-medium hover:text-[#4F46E5] text-center"
        >
          View all {debts.length} debts →
        </Link>
      )}
    </div>
  );
}
