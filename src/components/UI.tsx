import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'pink' | 'purple' | 'ghost' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'pink', size = 'md', ...props }, ref) => {
    const variants = {
      pink: 'btn-pink-purple',
      purple: 'btn-purple-blue',
      yellow: 'bg-brand-yellow text-slate-900 shadow-lg shadow-yellow-200/50 hover:shadow-yellow-300/60 hover:scale-[1.02]',
      ghost: 'bg-transparent hover:bg-pink-50 text-slate-600 shadow-none active:translate-y-0',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-xl',
      md: 'px-8 py-4 text-base rounded-[18px]',
      lg: 'px-10 py-5 text-lg rounded-[22px]',
    };

    return (
      <button
        ref={ref}
        className={cn('ed-button', variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('ed-card p-8', className)} {...props}>
    {children}
  </div>
);

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/20 backdrop-blur-md">
      <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-8 border-white">
        <div className="p-8 border-b-4 border-brand-bg flex items-center justify-between bg-white">
          <h3 className="text-3xl font-display font-black text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-3 hover:bg-brand-bg rounded-2xl transition-all active:scale-90">
            <X className="w-8 h-8 text-slate-400" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};
