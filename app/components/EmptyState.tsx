'use client';

import Icon, { type IconName } from '@/app/components/Icon';

interface EmptyStateProps {
  iconName: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  iconName,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-20 h-20 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-4">
        <Icon name={iconName} size={40} />
      </div>
      <h3 className="text-lg font-semibold text-[#1F2937] mb-2">{title}</h3>
      <p className="text-sm text-[#6B7280] text-center max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-[#6366F1] text-white rounded-xl font-medium hover:bg-[#4F46E5] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
