import { Icon } from '@iconify/react';
import { cn } from '../lib/utils';

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'green' | 'red' | 'outline';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export function BrutalistButton({
  children,
  variant = 'default',
  icon,
  iconPosition = 'left',
  loading,
  className,
  disabled,
  ...props
}: BrutalistButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 border-4 border-black px-6 py-3 font-bold text-lg uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-black text-white hover:bg-red hover:text-black active:translate-y-1 active:shadow-none',
    green: 'bg-green text-black hover:bg-black hover:text-green active:translate-y-1 active:shadow-none',
    red: 'bg-red text-white hover:bg-black hover:text-red active:translate-y-1 active:shadow-none',
    outline: 'bg-white text-black hover:bg-yellow active:translate-y-1 active:shadow-none',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Icon icon="majesticons:spinner" className="animate-spin h-5 w-5" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <Icon icon={icon} className="h-5 w-5" />}
          {children}
          {icon && iconPosition === 'right' && <Icon icon={icon} className="h-5 w-5" />}
        </>
      )}
    </button>
  );
}
