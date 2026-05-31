import { cn } from '../lib/utils';

interface PaymentProgressProps {
  percentage: number;
  collected: number;
  total: number;
  currency?: string;
  className?: string;
  showLabel?: boolean;
}

export function PaymentProgress({ 
  percentage, 
  collected, 
  total, 
  currency = 'MYR',
  className,
  showLabel = true 
}: PaymentProgressProps) {
  const getColor = () => {
    if (percentage >= 100) return 'bg-green';
    if (percentage >= 50) return 'bg-yellow';
    return 'bg-red';
  };

  const getMessage = () => {
    if (percentage >= 100) return 'EVERYONE PAID! 🎉';
    if (percentage >= 75) return 'Almost there...';
    if (percentage >= 50) return 'Halfway... keep pushing!';
    if (percentage >= 25) return 'Still a long way to go...';
    return 'The hunt begins... 💀';
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-end mb-2">
          <span className="font-heading text-lg uppercase">{getMessage()}</span>
          <span className="font-bold text-xl">
            {new Intl.NumberFormat('en-MY', { style: 'currency', currency }).format(collected)}
            <span className="text-gray-500 text-sm mx-1">/</span>
            {new Intl.NumberFormat('en-MY', { style: 'currency', currency }).format(total)}
          </span>
        </div>
      )}
      
      <div className="border-4 border-black h-10 bg-gray-200 relative overflow-hidden">
        <div 
          className={cn('h-full transition-all duration-700 ease-out flex items-center justify-center', getColor())}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {percentage > 15 && (
            <span className="font-bold text-black text-sm drop-shadow-md">
              {percentage}%
            </span>
          )}
        </div>
        {percentage <= 15 && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-black text-sm">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}
