import { Icon } from '@iconify/react';
import { cn, formatCurrency, getDaysUntil, getConsequenceMessage } from '../lib/utils';
import type { BillWithStats } from '../types';
import { PaymentProgress } from './PaymentProgress';
import { CategoryBadge } from './CategoryBadge';

interface BillCardProps {
  bill: BillWithStats;
  onClick?: () => void;
  className?: string;
}

export function BillCard({ bill, onClick, className }: BillCardProps) {
  const daysLeft = bill.due_date ? getDaysUntil(bill.due_date) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'border-4 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 cursor-pointer',
        isOverdue && 'animate-shake border-red',
        isUrgent && 'border-yellow',
        className
      )}
    >
      <div className="flex justify-between items-start mb-3 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {bill.category && <CategoryBadge category={bill.category} size="sm" />}
            {bill.tags && bill.tags.length > 0 && bill.tags.slice(0, 2).map((t) => (
              <span key={t} className="text-xs text-gray-500">#{t}</span>
            ))}
          </div>
          <h3 className="text-xl font-heading uppercase m-0 line-clamp-1">{bill.title}</h3>
          <p className="text-sm text-gray-600 mt-1">by {bill.organizer_name}</p>
        </div>
        <div className="bg-black text-white px-3 py-1 font-bold whitespace-nowrap">
          {formatCurrency(bill.total_amount, bill.currency)}
        </div>
      </div>

      {bill.description && (
        <p className="text-sm mb-3 line-clamp-2 text-gray-700">{bill.description}</p>
      )}

      <PaymentProgress
        percentage={bill.stats.progress_percentage}
        collected={bill.stats.collected_amount}
        total={bill.total_amount}
        currency={bill.currency}
        showLabel={false}
        className="mb-3"
      />

      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <Icon icon="majesticons:users" className="h-4 w-4" />
          <span>{bill.stats.paid_count}/{bill.stats.total_participants} paid</span>
          {bill.stats.collected_amount > 0 && (
            <span className="text-green-700 font-bold text-xs">
              · {formatCurrency(bill.stats.collected_amount, bill.currency)}
            </span>
          )}
        </div>

        {daysLeft !== null && (
          <div className={cn('flex items-center gap-1 font-bold', isOverdue ? 'text-red' : isUrgent ? 'text-orange' : 'text-gray-600')}>
            <Icon icon={isOverdue ? 'majesticons:skull' : 'majesticons:clock'} className="h-4 w-4" />
            <span>{isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'due today' : `${daysLeft}d left`}</span>
          </div>
        )}
      </div>

      {isOverdue && (
        <div className="mt-3 bg-red text-white text-center py-1 font-bold text-xs uppercase animate-pulse">
          {getConsequenceMessage(daysLeft!)}
        </div>
      )}
    </div>
  );
}
