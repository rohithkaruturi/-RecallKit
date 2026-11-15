import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hoverEffect
    ? 'transition-all duration-200 hover:shadow-md hover:border-gray-300'
    : '';

  return (
    <div
      className={`panel-surface rounded-[28px] border border-white/70 shadow-[0_20px_55px_rgba(20,25,44,0.07)] ${paddingStyles[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
