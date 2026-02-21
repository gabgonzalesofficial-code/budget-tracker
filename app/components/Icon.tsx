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
  'pouch',
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
  'lightbulb',
  'graph',
  'awardcup',
  'rocket',
  'darttarget',
  'cart',
  'wallet',
  'paperplane',
  'smartphone',
  'lappy',
  'compass',
  'shield',
  'discount',
  'hourglass',
  'coins',
  'coffee',
  'logotext',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const ICON_FILE_MAP: Record<IconName, string> = {
  income: '/icons/increment.png',
  expense: '/icons/decrement.png',
  pouch: '/icons/moneypouch.png',
  debt: '/icons/creditcard.png',
  budget: '/icons/268766_money-gear-icon.png',
  chart: '/icons/268771_target-with-money-icon.png',
  dashboard: '/icons/cashbills.png',
  savings: '/icons/piggybank.png',
  add: '/icons/268769_calculator-icon.png',
  calendar: '/icons/268779_payment-date-icon.png',
  wallet: '/icons/wallet.png',
  neutral: '/icons/268780_coin-icon.png',
  email: '/icons/Email.png',
  password: '/icons/password.png',
  mainlogo: '/icons/main-logo.png',       
  logowithtext: '/icons/main-logo-with-text.gif',
  logotext: '/icons/logotext.png',
  robotassistant: '/icons/robotassistant.png',
  lightbulb: '/icons/lightbulb.png',
  graph: '/icons/graph.png',
  awardcup: '/icons/awardcup.png',
  rocket: '/icons/rocket.png',
  darttarget: '/icons/darttarget.png',
  cart: '/icons/cart.png',
  paperplane: '/icons/paperplane.png',
  smartphone: '/icons/smartphone.png',
  lappy: '/icons/lappy.png',
  compass: '/icons/compass.png',
  shield: '/icons/shield.png',
  discount: '/icons/discount.png',
  hourglass: '/icons/hourglass.png',
  coins: '/icons/coins.png',
  coffee: '/icons/coffee.png',
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
