'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  variant?: 'danger' | 'default';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loadingLabel = 'Processing...',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E5E7EB] p-6 sm:p-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
              isDanger ? 'bg-[#FEE2E2]' : 'bg-[#D1FAE5]'
            }`}
          >
            <AlertTriangle
              className={`w-6 h-6 ${isDanger ? 'text-[#EF4444]' : 'text-[#059669]'}`}
            />
          </div>
          <div className="flex-1">
            <h2
              id="confirm-modal-title"
              className="text-lg font-semibold text-[#1F2937] mb-2"
            >
              {title}
            </h2>
            <p className="text-[#6B7280]">{message}</p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border-2 border-[#E5E7EB] text-[#6B7280] rounded-2xl font-medium hover:bg-[#F9FAFB] transition-colors disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              isDanger
                ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                : 'bg-[#059669] text-white hover:bg-[#047857]'
            }`}
          >
            {isLoading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
