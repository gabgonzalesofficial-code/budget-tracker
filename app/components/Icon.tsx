'use client';

import Image from 'next/image';

/**
 * Semantic icon names mapped to public/icons/ files.
 * Use only these names—match filename semantics.
 * No external icon libraries.
 */
export const ICON_NAMES = [
  'income',
  'expense',
  'salary',
  'debt',
  'budget',
  'chart',
  'dashboard',
  'savings',
  'add',
  'calendar',
  'wallet',
  'neutral',
  'email',  
  'password',
  'mainlogo',
  'logowithtext',
  'robotassistant',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const ICON_FILE_MAP: Record<IconName, string> = {
  income: '/icons/268765_financial-growth-icon.png',
  expense: '/icons/268764_financial-decline-icon.png',
  salary: '/icons/268777_money-bag-icon.png',
  debt: '/icons/268781_credit-card-icon.png',
  budget: '/icons/268766_money-gear-icon.png',
  chart: '/icons/268771_target-with-money-icon.png',
  dashboard: '/icons/268768_stack-of-money-icon.png',
  savings: '/icons/268770_saving-money-icon.png',
  add: '/icons/268769_calculator-icon.png',
  calendar: '/icons/268779_payment-date-icon.png',
  wallet: '/icons/268780_coin-icon.png',
  neutral: '/icons/268780_coin-icon.png',
  email: '/icons/Email.png',
  password: '/icons/password.png',
  mainlogo: '/icons/main-logo.png',       
  logowithtext: '/icons/main-logo-with-text.gif',
  robotassistant: '/icons/robotassistant.png',
};

/** Maps legacy DB icon_name to semantic IconName. Fallback: neutral. */
export const CATEGORY_ICON_MAP: Record<string, IconName> = {
  Utensils: 'expense',
  Car: 'expense',
  ShoppingBag: 'expense',
  Home: 'expense',
  Coffee: 'expense',
  Lightbulb: 'expense',
  Heart: 'expense',
  GraduationCap: 'expense',
  Smartphone: 'expense',
  Tag: 'expense',
  TrendingUp: 'income',
  DollarSign: 'neutral',
  CreditCard: 'debt',
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  ariaHidden?: boolean;
  alt?: string;
  /** Use on dark backgrounds to lighten icon */
  invert?: boolean;
}

export default function Icon({
  name,
  size = 24,
  className = '',
  ariaHidden = true,
  alt = '',
  invert = false,
}: IconProps) {
  const src = ICON_FILE_MAP[name] ?? ICON_FILE_MAP.neutral;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${invert ? 'invert' : ''} ${className}`}
      style={{ width: size, minWidth: size, height: size, minHeight: size }}
      aria-hidden={ariaHidden}
    >
      <Image
        src={src}
        width={size}
        height={size}
        alt={alt || `${name} icon`}
        aria-hidden
        unoptimized
      />
    </span>
  );
}

export function getIconPath(name: IconName): string {
  return ICON_FILE_MAP[name] ?? ICON_FILE_MAP.neutral;
}
