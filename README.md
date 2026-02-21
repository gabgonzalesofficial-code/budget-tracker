# Budget Tracker

AI-powered personal budget tracker built with Next.js (App Router, TypeScript) and Supabase.

## Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure Supabase**

- Create a [Supabase](https://supabase.com) project
- Copy `.env.example` to `.env.local`
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your project settings
- For forgot-password: In Supabase Dashboard → Authentication → URL Configuration, add your redirect URL (e.g. `http://localhost:3000/auth/reset-password` for local dev, or your production URL + `/auth/reset-password`)

3. **Configure Groq AI (for AI Assistant)**

- Create a [Groq](https://console.groq.com) account and get an API key
- Add `GROQ_API_KEY=your-key-here` to your `.env` file
- The AI Assistant will work without it but will show an error when chatting
- Run migrations in order in the Supabase SQL editor:
  - `supabase/migrations/001_initial_schema.sql`
  - `supabase/migrations/002_salary_support.sql`
  - `supabase/migrations/003_debts.sql`

4. **Run the app**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You’ll be redirected to `/dashboard`; unauthenticated users are sent to `/auth/login`.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to dashboard |
| `/auth/login` | Sign in / sign up |
| `/auth/reset-password` | Set new password (from email link) |
| `/dashboard` | Overview, AI insights, budget usage, recent activity |
| `/transactions` | Transaction list |
| `/transactions/new` | Add a transaction |
| `/budget` | Manage monthly budgets by category |
| `/ai-assistant` | AI chat for financial questions |
| `/debts` | Debt list and overview |
| `/debts/new` | Add a debt |
| `/debts/pay` | Record a debt payment |
| `/settings` | Currency, profile name, change password |

## Data Model

- **categories** – Seeded expense/income/other_revenue categories
- **transactions** – User transactions (expense, income, other_revenue, debt_payment)
- **budgets** – Monthly budget limits per category
- **debts** – Loans, credit cards, personal debt with remaining balance

Currency is Philippine Peso (₱).

Data is stored with clear structure for later AI analysis (trends, overages, income vs expenses).

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + PostgreSQL)
- Groq AI (Llama 3.3 70B for AI Assistant)
- Recharts
- Lucide React
