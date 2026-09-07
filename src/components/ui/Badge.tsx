import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'rose' | 'indigo' | 'amber' | 'slate' | 'purple' | 'cyan' | 'teal';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className,
}) => {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold',
    amber: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
    cyan: 'bg-cyan-50 text-cyan-800 border-cyan-300 font-semibold',
    teal: 'bg-teal-50 text-teal-800 border-teal-300 font-semibold',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full border tracking-wide uppercase',
          variants[variant],
          sizes[size],
          className
        )
      )}
    >
      {children}
    </span>
  );
};
