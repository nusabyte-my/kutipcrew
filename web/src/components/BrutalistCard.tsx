import { Icon } from '@iconify/react';
import { cn } from '../lib/utils';

interface BrutalistCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: string;
  headerAction?: React.ReactNode;
}

export function BrutalistCard({ children, className, title, icon, headerAction }: BrutalistCardProps) {
  return (
    <div className={cn('border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1', className)}>
      {(title || icon || headerAction) && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b-4 border-black">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="bg-black text-white p-2">
                <Icon icon={icon} className="h-6 w-6" />
              </div>
            )}
            {title && <h3 className="text-xl font-heading uppercase m-0">{title}</h3>}
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}
