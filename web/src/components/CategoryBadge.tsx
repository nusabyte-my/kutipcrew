import { Icon } from '@iconify/react';
import { CATEGORY_META, type BillCategory } from '../types';

interface CategoryBadgeProps {
  category?: BillCategory;
  size?: 'sm' | 'md';
  className?: string;
}

export function CategoryBadge({ category = 'other', size = 'md', className }: CategoryBadgeProps) {
  const meta = CATEGORY_META[category];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 ${padding} border-2 border-black ${meta.color} font-bold uppercase ${className || ''}`}>
      <Icon icon={meta.icon} className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {meta.label}
    </span>
  );
}
