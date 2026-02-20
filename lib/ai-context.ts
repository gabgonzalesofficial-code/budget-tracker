import { listTransactions, getMonthlyTrends } from '@/lib/queries/transactions';
import { getCategorySpending } from '@/lib/queries/budgets';
import { listAllDebts } from '@/lib/queries/debts';

export async function buildFinancialContext(symbol = '₱'): Promise<string> {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd =
      month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const [trends, categorySpending, transactions, debts] = await Promise.all([
      getMonthlyTrends(6),
      getCategorySpending(month, year),
      listTransactions({ from: monthStart, to: monthEnd, limit: 50 }),
      listAllDebts(),
    ]);

    let income = 0;
    let expenses = 0;
    for (const t of transactions) {
      const amt = Number(t.amount);
      if (t.type === 'expense' || t.type === 'debt_payment') expenses += amt;
      else if (t.type === 'income' || t.type === 'other_revenue') income += amt;
    }
    const balance = income - expenses;
    const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : '0';

    const fmt = (n: number) => `${symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

    const trendsText = trends
      .map((t) => `- ${t.month}: income ${fmt(t.income)}, spending ${fmt(t.spending)}`)
      .join('\n');

    const spendingByCategory = categorySpending
      .filter((s) => s.amount > 0)
      .map((s) => {
        const pct = s.budget > 0 ? ((s.amount / s.budget) * 100).toFixed(0) : 'N/A';
        return `- ${s.category_name}: spent ${fmt(s.amount)} of ${fmt(s.budget)} budget (${pct}%)`;
      })
      .join('\n');

    const debtSummary =
      debts.length > 0
        ? debts
            .filter((d) => d.remaining_balance > 0)
            .map((d) => `- ${d.name}: ${fmt(d.remaining_balance)} remaining of ${fmt(d.total_amount)}`)
            .join('\n') || 'No active debts.'
        : 'No debts tracked.';

    const recentTx = transactions.slice(0, 5).map((t) => {
      const amt = Number(t.amount);
      const sign = t.type === 'expense' || t.type === 'debt_payment' ? '-' : '+';
      const desc = t.description ?? (t.debt as { name?: string })?.name ?? 'Transaction';
      const cat = (t.category as { name?: string })?.name ?? t.type;
      return `- ${t.date}: ${desc} (${cat}) ${sign}${fmt(amt)}`;
    });

    return `
Current month (${now.toLocaleString('default', { month: 'long' })} ${year}):
- Income: ${fmt(income)}
- Expenses: ${fmt(expenses)}
- Balance: ${fmt(balance)}
- Savings rate: ${savingsRate}%

Monthly trends (last 6 months):
${trendsText || 'No data yet.'}

Category spending vs budget this month:
${spendingByCategory || 'No budgets or spending data.'}

Active debts:
${debtSummary}

Recent transactions:
${recentTx.join('\n') || 'None.'}
`.trim();
  } catch {
    return 'Unable to load financial data. User may need to add transactions and budgets.';
  }
}
