'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Settings } from 'lucide-react';
import Icon, { CATEGORY_ICON_MAP, type IconName } from '@/app/components/Icon';
import { useCurrency } from '@/context/CurrencyContext';
import { listBudgets, getCategorySpending, upsertBudget, deleteBudget } from '@/lib/queries/budgets';
import { getCategories } from '@/lib/queries/categories';
import type { Budget } from '@/lib/types';

interface BudgetWithSpending extends Budget {
  spent: number;
  categoryName: string;
  color: string;
  iconName: IconName;
}

export default function BudgetManagement() {
  const { formatAmount } = useCurrency();
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([]);
  const [totals, setTotals] = useState({ budget: 0, spent: 0 });
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [expenseCategories, setExpenseCategories] = useState<{ id: string; name: string; color?: string; icon_name?: string }[]>([]);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    async function load() {
      try {
        const [budgetList, spending, categories] = await Promise.all([
          listBudgets(month, year),
          getCategorySpending(month, year),
          getCategories('expense'),
        ]);

        setExpenseCategories(categories);

        const spentByCategory: Record<string, number> = {};
        for (const s of spending) {
          spentByCategory[s.category_id] = s.amount;
        }

        const merged: BudgetWithSpending[] = budgetList.map((b) => {
          const cat = b.category as { name?: string; color?: string; icon_name?: string } | null;
          const spent = spentByCategory[b.category_id] ?? 0;
          const iconName = (cat?.icon_name && CATEGORY_ICON_MAP[cat.icon_name]) || 'budget';
          return {
            ...b,
            spent,
            categoryName: cat?.name ?? 'Unknown',
            color: cat?.color ?? '#059669',
            iconName,
          };
        });

        setBudgets(merged);
        const totalBudget = merged.reduce((s, b) => s + Number(b.amount), 0);
        const totalSpent = merged.reduce((s, b) => s + b.spent, 0);
        setTotals({ budget: totalBudget, spent: totalSpent });
      } catch {
        setBudgets([]);
      }
    }
    load();
  }, [month, year]);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryId || !newAmount) return;
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt < 0) return;

    try {
      await upsertBudget(newCategoryId, amt, month, year);
      setNewCategoryId('');
      setNewAmount('');
      setIsAddingBudget(false);
      const [budgetList, spending] = await Promise.all([
        listBudgets(month, year),
        getCategorySpending(month, year),
      ]);
      const spentByCategory: Record<string, number> = {};
      for (const s of spending) {
        spentByCategory[s.category_id] = s.amount;
      }
      const merged: BudgetWithSpending[] = budgetList.map((b) => {
        const cat = b.category as { name?: string; color?: string; icon_name?: string } | null;
        const spent = spentByCategory[b.category_id] ?? 0;
        const iconName = (cat?.icon_name && CATEGORY_ICON_MAP[cat.icon_name]) || 'budget';
        return {
          ...b,
          spent,
          categoryName: cat?.name ?? 'Unknown',
          iconName,
          color: cat?.color ?? '#059669',
        };
      });
      setBudgets(merged);
      setTotals({
        budget: merged.reduce((s, b) => s + Number(b.amount), 0),
        spent: merged.reduce((s, b) => s + b.spent, 0),
      });
    } catch {
      // ignore
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      setTotals((prev) => ({
        ...prev,
        budget: prev.budget - (budgets.find((b) => b.id === id)?.amount ?? 0),
      }));
    } catch {
      // ignore
    }
  };

  const totalBudget = totals.budget;
  const totalSpent = totals.spent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const categoriesWithBudgets = new Set(budgets.map((b) => b.category_id));
  const availableCategories = expenseCategories.filter((c) => !categoriesWithBudgets.has(c.id));

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1F2937] mb-2">Budget Management</h1>
          <p className="text-[#6B7280]">Set and track monthly spending limits for each category</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E5E7EB] mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1F2937] mb-1">Total Monthly Budget</h2>
              <p className="text-3xl font-bold text-[#1F2937]">{formatAmount(totalBudget)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#6B7280] mb-1">Spent This Month</p>
              <p className="text-2xl font-semibold text-[#059669]">{formatAmount(totalSpent)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280]">Overall Budget Usage</span>
              <span className="font-medium text-[#1F2937]">{percentageUsed.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[#F3F4F6] rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percentageUsed > 100 ? 'bg-[#EF4444]' : percentageUsed > 80 ? 'bg-[#F59E0B]' : 'bg-[#059669]'
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
            <p className="text-xs text-[#6B7280]">
              {formatAmount(totalBudget - totalSpent)} remaining
            </p>
          </div>
        </div>

        <div className="mb-6">
          <button
            type="button"
            onClick={() => setIsAddingBudget(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#059669] text-white rounded-2xl font-medium hover:bg-[#047857] transition-colors shadow-sm"
          >
            <Icon name="add" size={20} />
            Add New Budget
          </button>
        </div>

        {isAddingBudget && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E5E7EB] mb-6">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Add New Budget</h3>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[#374151] mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select category</option>
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  {availableCategories.length === 0 && (
                    <option value="" disabled>
                      All expense categories have budgets
                    </option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-[#374151] mb-2">
                  Monthly Budget
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingBudget(false)}
                  className="flex-1 py-3 border-2 border-[#E5E7EB] text-[#6B7280] rounded-xl font-medium hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#059669] text-white rounded-xl font-medium hover:bg-[#047857] transition-colors"
                >
                  Add Budget
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const percentage = budget.amount > 0 ? (budget.spent / Number(budget.amount)) * 100 : 0;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80 && percentage <= 100;
            const remaining = Number(budget.amount) - budget.spent;

            return (
              <div
                key={budget.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${budget.color}15` }}
                    >
                      <Icon name={budget.iconName} size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1F2937]">{budget.categoryName}</h3>
                      <p className="text-sm text-[#6B7280]">Monthly Budget</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                      <Settings className="w-4 h-4 text-[#6B7280]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors"
                    >
                      <Icon name="expense" size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-2xl font-bold text-[#1F2937]">
                      {formatAmount(budget.spent)}
                    </span>
                    <span className="text-sm text-[#6B7280]">
                      of {formatAmount(Number(budget.amount))}
                    </span>
                  </div>

                  <div className="w-full bg-[#F3F4F6] rounded-full h-2.5 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverBudget ? 'bg-[#EF4444]' : isNearLimit ? 'bg-[#F59E0B]' : 'bg-[#059669]'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`font-medium ${
                        isOverBudget ? 'text-[#EF4444]' : isNearLimit ? 'text-[#F59E0B]' : 'text-[#6B7280]'
                      }`}
                    >
                      {percentage.toFixed(0)}% used
                    </span>
                    <span className={remaining < 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}>
                      {remaining < 0 ? `${formatAmount(Math.abs(remaining))} over` : `${formatAmount(remaining)} left`}
                    </span>
                  </div>
                </div>

                {isNearLimit && !isOverBudget && (
                  <div className="flex items-start gap-2 p-3 bg-[#FEF3C7] rounded-xl">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#D97706]" />
                    <p className="text-xs text-[#92400E]">
                      You&apos;re approaching your budget limit. Consider reducing spending in this category.
                    </p>
                  </div>
                )}

                {isOverBudget && (
                  <div className="flex items-start gap-2 p-3 bg-[#FEE2E2] rounded-xl">
                    <Icon name="expense" size={16} className="mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[#991B1B]">
                      You&apos;ve exceeded your budget for this category. Review your spending.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] rounded-3xl p-6 border border-[#6EE7B7]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#059669] rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="income" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-[#1F2937] mb-2">AI Budget Recommendation</h3>
              <p className="text-sm text-[#4338CA] mb-3">
                Track your spending for a few months to receive personalized budget recommendations. Visit the AI
                Assistant for data-driven suggestions.
              </p>
              <Link
                href="/ai-assistant"
                className="text-sm font-medium text-[#059669] hover:text-[#047857] transition-colors"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
