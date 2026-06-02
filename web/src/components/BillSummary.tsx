import { useQuery } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { BrutalistCard } from './BrutalistCard';
import { api } from '../lib/api';
import { formatCurrency, timeAgo } from '../lib/utils';

interface BillSummaryProps {
  billId: string;
  currency: string;
  className?: string;
}

const ACTIVITY_ICONS: Record<string, string> = {
  created: 'majesticons:plus-circle',
  paid: 'majesticons:check-circle',
  unpaid: 'majesticons:x-circle',
  message: 'majesticons:chat',
  whatsapp_sent: 'majesticons:whatsapp',
  updated: 'majesticons:edit',
};

const ACTIVITY_COLORS: Record<string, string> = {
  created: 'bg-blue',
  paid: 'bg-green',
  unpaid: 'bg-red',
  message: 'bg-yellow',
  whatsapp_sent: 'bg-black text-white',
  updated: 'bg-gray-200',
};

export function BillSummary({ billId, currency, className }: BillSummaryProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['bill-summary', billId],
    queryFn: () => api.getBillSummary(billId),
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <BrutalistCard title="Activity Feed" className={className} icon="majesticons:activity">
        <div className="text-center py-6 text-gray-500">
          <Icon icon="majesticons:spinner" className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading activity...</p>
        </div>
      </BrutalistCard>
    );
  }

  if (!data) return null;

  return (
    <BrutalistCard title="Activity & Insights" className={className} icon="majesticons:activity">
      {data.top_delinquents.length > 0 && (
        <div className="mb-4">
          <h4 className="font-heading text-sm uppercase mb-2 flex items-center gap-2">
            <Icon icon="majesticons:flame" className="h-4 w-4 text-red" />
            Top Delinquents
          </h4>
          <div className="space-y-2">
            {data.top_delinquents.map((d, i) => (
              <div key={d.id} className="flex items-center justify-between border-4 border-black p-2 bg-red/10">
                <div className="flex items-center gap-2">
                  <span className="bg-red text-white border-2 border-black w-7 h-7 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </span>
                  <span className="font-bold">{d.name}</span>
                  {d.days_overdue > 0 && (
                    <span className="bg-black text-white text-xs px-2 py-0.5 font-bold uppercase">
                      {d.days_overdue}d overdue
                    </span>
                  )}
                </div>
                <span className="font-bold">{formatCurrency(d.amount, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-heading text-sm uppercase mb-2 flex items-center gap-2">
          <Icon icon="majesticons:clock" className="h-4 w-4" />
          Recent Activity
        </h4>
        {data.recent_activity.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No activity yet.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {data.recent_activity.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className={`flex-shrink-0 w-7 h-7 border-2 border-black flex items-center justify-center ${ACTIVITY_COLORS[a.type] || 'bg-gray-200'}`}>
                  <Icon icon={ACTIVITY_ICONS[a.type] || 'majesticons:dot'} className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 font-bold">
                    {a.type === 'created' && `Bill created`}
                    {a.type === 'paid' && `${a.participant_name} paid`}
                    {a.type === 'unpaid' && `${a.participant_name} marked unpaid`}
                    {a.type === 'message' && `${a.participant_name || 'Someone'} sent a message`}
                    {a.type === 'whatsapp_sent' && `WhatsApp threats sent`}
                    {a.type === 'updated' && `Bill updated`}
                    {a.amount != null && (
                      <span className="ml-1 font-normal text-gray-600">({formatCurrency(a.amount, currency)})</span>
                    )}
                  </p>
                  {a.notes && <p className="m-0 text-xs text-gray-500">{a.notes}</p>}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(a.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </BrutalistCard>
  );
}
