import React from 'react';
import { AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  retryable?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Generation Error',
  message,
  retryable = true,
  onRetry,
  onDismiss,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`rounded-[24px] bg-[linear-gradient(135deg,#fff3f3,#fff7f5)] border border-[#fecaca] p-5 text-[#7a1d1d] shadow-[0_18px_30px_rgba(127,29,29,0.06)] ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#fee2e2] flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-[#dc2626]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-[#7a1d1d]">{title}</h4>
          <p className="text-sm text-[#a93838] mt-1 leading-relaxed break-words">{message}</p>

          {(retryable && onRetry) && (
            <div className="mt-4 flex items-center gap-3">
              <Button
                size="sm"
                variant="danger"
                onClick={onRetry}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Try Again
              </Button>
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="text-xs font-semibold text-[#a73434] hover:text-[#7f1d1d] cursor-pointer"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-[#c94848] hover:text-[#8a1d1d] cursor-pointer"
            aria-label="Close error"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
