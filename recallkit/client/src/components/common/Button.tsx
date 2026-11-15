import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#4a39d2] to-[#7a5cf8] text-white shadow-[0_16px_35px_rgba(92,79,217,0.28)] hover:shadow-[0_20px_40px_rgba(92,79,217,0.35)] hover:translate-y-[-1px] active:translate-y-0 focus:ring-indigo-500',
    secondary:
      'bg-[#f2edff] text-[#3a2eb1] hover:bg-[#e9e1ff] active:bg-[#e0d7ff] focus:ring-indigo-400',
    outline:
      'border border-[#d9d7f6] bg-white/70 text-[#2a2d40] hover:bg-white hover:border-[#c7c4f5] focus:ring-indigo-500',
    ghost:
      'bg-transparent text-[#4e5877] hover:bg-white/70 active:bg-[#eef2ff] focus:ring-gray-400',
    danger:
      'bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white shadow-[0_16px_35px_rgba(239,68,68,0.25)] hover:translate-y-[-1px] focus:ring-red-500',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};
