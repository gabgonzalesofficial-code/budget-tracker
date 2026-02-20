'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CURRENCIES, type CurrencyCode } from '@/lib/currencies';

type CurrencyConfig = (typeof CURRENCIES)[CurrencyCode];

interface CurrencyContextValue {
  currencyCode: CurrencyCode;
  symbol: string;
  formatAmount: (amount: number, compact?: boolean) => string;
  setCurrency: (code: CurrencyCode) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function formatWithConfig(amount: number, config: CurrencyConfig, compact: boolean): string {
  const opts = compact
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return `${config.symbol}${amount.toLocaleString(config.locale as string, opts)}`;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('PHP');
  const [ready, setReady] = useState(false);

  const config = CURRENCIES[currencyCode];

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const code = (user?.user_metadata?.currency as CurrencyCode) || 'PHP';
      if (CURRENCIES[code]) setCurrencyCode(code);
      setReady(true);
    });
  }, []);

  const setCurrency = useCallback(async (code: CurrencyCode) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.auth.updateUser({
      data: { ...user.user_metadata, currency: code },
    });
    setCurrencyCode(code);
  }, []);

  const formatAmount = useCallback(
    (amount: number, compact = false) => formatWithConfig(amount, config, compact),
    [config]
  );

  if (!ready) {
    return (
      <CurrencyContext.Provider
        value={{
          currencyCode: 'PHP',
          symbol: '₱',
          formatAmount: (a, c) => formatWithConfig(a, CURRENCIES.PHP, !!c),
          setCurrency: async () => {},
        }}
      >
        {children}
      </CurrencyContext.Provider>
    );
  }

  return (
    <CurrencyContext.Provider
      value={{
        currencyCode,
        symbol: config.symbol,
        formatAmount,
        setCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    const fallback = CURRENCIES.PHP;
    return {
      currencyCode: 'PHP',
      symbol: fallback.symbol,
      formatAmount: (a: number, c?: boolean) => formatWithConfig(a, fallback, !!c),
      setCurrency: async () => {},
    };
  }
  return ctx;
}
