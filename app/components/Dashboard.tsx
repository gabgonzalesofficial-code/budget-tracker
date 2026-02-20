'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { listTransactions, getMonthlyTrends } from '@/lib/queries/transactions';
import { getCategorySpending } from '@/lib/queries/budgets';
import { useCurrency } from '@/context/CurrencyContext';
import DebtOverview from '@/app/components/DebtOverview';
import UserMenu from '@/app/components/UserMenu';
import { Bell, Settings } from 'lucide-react';
import Icon, { CATEGORY_ICON_MAP, type IconName } from '@/app/components/Icon';
import type { Transaction } from '@/lib/types';

export default function Dashboard() {
  const { formatAmount } = useCurrency();
  const [spendingData, setSpendingData] = useState<{ month: string; spending: number; income: number }[]>([]);
  const [categorySpending, setCategorySpending] = useState<
    { category: string; amount: number; budget: number; iconName: IconName; color: string }[]
  >([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState({ income: 0, expenses: 0 });
  const [userName, setUserName] = useState<string>('');

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUserName(user?.user_metadata?.full_name?.split(' ')[0] ?? 'User');

        const [trends, spending, txList] = await Promise.all([
          getMonthlyTrends(6),
          getCategorySpending(month, year),
          listTransactions({ limit: 5 }),
        ]);

        setSpendingData(trends);
        setRecentTransactions(txList);

        let income = 0;
        let expenses = 0;
        for (const t of txList) {
          if (t.type === 'expense') expenses += Number(t.amount);
          else income += Number(t.amount);
        }
        const thisMonthTx = await listTransactions({
          from: `${year}-${String(month).padStart(2, '0')}-01`,
          to: `${year}-${String(month).padStart(2, '0')}-31`,
          limit: 500,
        });
        income = 0;
        expenses = 0;
        for (const t of thisMonthTx) {
          if (t.type === 'expense') expenses += Number(t.amount);
          else if (t.type === 'income' || t.type === 'other_revenue') income += Number(t.amount);
        }
        setTotals({ income, expenses });

        setCategorySpending(
          spending.map((s) => ({
            category: s.category_name,
            amount: s.amount,
            budget: s.budget,
            iconName: (s.icon_name && CATEGORY_ICON_MAP[s.icon_name]) || 'expense',
            color: s.color ?? '#059669',
          }))
        );
      } catch {
        setSpendingData([
          { month: 'Jan', spending: 0, income: 0 },
          { month: 'Feb', spending: 0, income: 0 },
          { month: 'Mar', spending: 0, income: 0 },
          { month: 'Apr', spending: 0, income: 0 },
          { month: 'May', spending: 0, income: 0 },
          { month: 'Jun', spending: 0, income: 0 },
        ]);
      }
    }
    load();
  }, [month, year]);

  const balance = totals.income - totals.expenses;
  const savingsRate = totals.income > 0 ? ((balance / totals.income) * 100).toFixed(0) : '0';

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <Icon name="mainlogo" size={100} alt="Budge-jet Tracker" ariaHidden={false} />
              </div>
              <h1 className="text-xl font-semibold text-[#1F2937]">Budge-jet</h1>
            </Link>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors" aria-label="Notifications">
                <Bell className="w-5 h-5 text-[#6B7280]" />
              </button>
              <Link href="/settings" className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors" aria-label="Settings">
                <Settings className="w-5 h-5 text-[#6B7280]" />
              </Link>
              <UserMenu initials={userName.slice(0, 2).toUpperCase()} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#1F2937] mb-2">
            Welcome back, {userName}
          </h2>
          <p className="text-[#6B7280]">
            Here&apos;s your financial overview for {now.toLocaleString('default', { month: 'long' })} {year}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#059669] to-[#047857] rounded-3xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Icon name="chart" size={24} alt="AI Insight" ariaHidden={false} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">AI Insight</h3>
              <p className="text-white/90 mb-4 leading-relaxed">
                {balance >= 0
                  ? `You have a ${savingsRate}% savings rate this month. Keep tracking transactions for personalized AI insights.`
                  : 'Spending exceeds income this month. Consider reviewing your budgets and reducing non-essential expenses.'}
              </p>
              <div className="flex gap-3">
                <Link
                  href="/ai-assistant"
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#6B7280] text-sm font-medium">Monthly Balance</span>
              <div className="w-10 h-10 bg-[#DBEAFE] rounded-xl flex items-center justify-center">
                <Icon name="dashboard" size={20} />
              </div>
            </div>
            <div className="text-3xl font-semibold text-[#1F2937] mb-1">
              {formatAmount(balance)}
            </div>
            <div className="flex items-center gap-1 text-[#10B981] text-sm">
              <Icon name="income" size={16} />
              <span>{savingsRate}% savings rate</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#6B7280] text-sm font-medium">Total Income</span>
              <div className="w-10 h-10 bg-[#D1FAE5] rounded-xl flex items-center justify-center">
                <Icon name="income" size={20} />
              </div>
            </div>
            <div className="text-3xl font-semibold text-[#1F2937] mb-1">
              {formatAmount(totals.income)}
            </div>
            <div className="text-[#6B7280] text-sm">Including other revenue</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#6B7280] text-sm font-medium">Total Expenses</span>
              <div className="w-10 h-10 bg-[#FEE2E2] rounded-xl flex items-center justify-center">
                <Icon name="expense" size={20} />
              </div>
            </div>
            <div className="text-3xl font-semibold text-[#1F2937] mb-1">
              {formatAmount(totals.expenses)}
            </div>
            <div className="text-[#6B7280] text-sm">Across all categories</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-6">Spending Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '12px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Income" />
                  <Line type="monotone" dataKey="spending" stroke="#059669" strokeWidth={2} name="Spending" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1F2937]">Budget Usage</h3>
                <Link
                  href="/budget"
                  className="text-sm text-[#059669] font-medium hover:text-[#047857] transition-colors"
                >
                  Manage Budgets
                </Link>
              </div>
              <div className="space-y-4">
                {categorySpending.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No budgets set yet. Add budgets to track spending by category.</p>
                ) : (
                  categorySpending.map((item) => {
                    const percentage = item.budget > 0 ? (item.amount / item.budget) * 100 : 0;
                    const isOverBudget = percentage > 100;
                    const isNearLimit = percentage > 80 && percentage <= 100;

                    return (
                      <div key={item.category}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${item.color}15` }}
                            >
                              <Icon name={item.iconName} size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#1F2937]">{item.category}</div>
                              <div className="text-xs text-[#6B7280]">
                                {formatAmount(item.amount)} of {formatAmount(item.budget)}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-sm font-medium ${isOverBudget ? 'text-[#EF4444]' : isNearLimit ? 'text-[#F59E0B]' : 'text-[#6B7280]'}`}
                          >
                            {percentage.toFixed(0)}%
                          </div>
                        </div>
                        <div className="w-full bg-[#F3F4F6] rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-[#EF4444]' : isNearLimit ? 'bg-[#F59E0B]' : 'bg-[#059669]'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/transactions/new"
                  className="w-full flex items-center gap-3 p-4 bg-[#059669] hover:bg-[#047857] text-white rounded-xl transition-colors"
                >
                  <Icon name="add" size={20} />
                  <span className="font-medium">Add Transaction</span>
                </Link>
                <Link
                  href="/ai-assistant"
                  className="w-full flex items-center gap-3 p-4 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] rounded-xl transition-colors"
                >
                  <Icon name="robotassistant" size={20} />
                  <span className="font-medium">AI Assistant</span>
                </Link>
                <Link
                  href="/debts"
                  className="w-full flex items-center gap-3 p-4 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] rounded-xl transition-colors"
                >
                  <Icon name="debt" size={20} />
                  <span className="font-medium">Debts</span>
                </Link>
              </div>
            </div>

            <DebtOverview />

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1F2937]">Recent Activity</h3>
                <Link href="/transactions" className="text-sm text-[#059669] font-medium hover:text-[#047857] transition-colors">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentTransactions.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No transactions yet. Add your first transaction to get started.</p>
                ) : (
                  recentTransactions.map((t) => {
                    const isDebt = t.type === 'debt_payment';
                    const isIncome = t.type === 'income' || t.type === 'other_revenue';
                    const label = isDebt
                      ? (t.debt as { name?: string })?.name ?? t.description ?? 'Debt Payment'
                      : (t.description || 'Transaction');
                    const sublabel = isDebt ? 'Debt Payment' : (t.category as { name?: string })?.name ?? t.type;
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 hover:bg-[#F9FAFB] rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isIncome ? 'bg-[#D1FAE5]' : isDebt ? 'bg-[#FEF3C7]' : 'bg-[#F3F4F6]'
                            }`}
                          >
                            {isIncome ? (
                              <Icon name="income" size={20} />
                            ) : isDebt ? (
                              <Icon name="debt" size={20} />
                            ) : (
                              <Icon name="expense" size={20} />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#1F2937]">{label}</div>
                            <div className="text-xs text-[#6B7280]">{sublabel}</div>
                          </div>
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            isIncome ? 'text-[#10B981]' : isDebt ? 'text-[#D97706]' : 'text-[#1F2937]'
                          }`}
                        >
                          {isIncome ? '+' : isDebt ? '-' : '-'}{formatAmount(Math.abs(Number(t.amount)))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
