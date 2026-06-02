import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { BrutalistButton } from './BrutalistButton';
import { api } from '../lib/api';
import { formatDateTime, cn } from '../lib/utils';
import type { PaymentMethod } from '../types';

interface ParticipantPaymentInfoProps {
  billId: string;
  participantId: string;
  paid: boolean;
  paidAt?: string;
  onTogglePaid: (id: string, currentPaid: boolean) => void;
  isReadOnly?: boolean;
}

const PAYMENT_METHOD_META: Record<PaymentMethod, { label: string; icon: string }> = {
  cash: { label: 'Cash', icon: 'majesticons:money' },
  bank_transfer: { label: 'Bank Transfer', icon: 'majesticons:bank' },
  tng: { label: 'Touch n Go', icon: 'majesticons:smartphone' },
  duitnow: { label: 'DuitNow', icon: 'majesticons:qr-code' },
  other: { label: 'Other', icon: 'majesticons:coin' },
};

export function ParticipantPaymentInfo({
  billId,
  participantId,
  paid,
  paidAt,
  onTogglePaid,
  isReadOnly = false,
}: ParticipantPaymentInfoProps) {
  const [editing, setEditing] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('tng');
  const [reference, setReference] = useState('');
  const queryClient = useQueryClient();

  const markPaidMutation = useMutation({
    mutationFn: () => api.markAsPaid(participantId, {
      confirmedBy: 'organizer',
      paymentMethod: method,
      paymentReference: reference || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill'] });
      queryClient.invalidateQueries({ queryKey: ['bill-summary', billId] });
      setEditing(false);
      setReference('');
    },
  });

  if (paid && !editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 bg-green text-black border-4 border-black px-3 py-2 font-bold text-sm">
          <Icon icon="majesticons:check-circle" className="h-4 w-4" />
          PAID
        </span>
        {paidAt && <span className="text-xs text-gray-500">{formatDateTime(paidAt)}</span>}
        {!isReadOnly && (
          <button
            onClick={() => onTogglePaid(participantId, true)}
            className="text-xs text-gray-500 underline hover:text-red"
          >
            undo
          </button>
        )}
      </div>
    );
  }

  if (editing) {
    return (
      <div className="border-4 border-black p-3 bg-yellow/20 space-y-2">
        <p className="text-xs font-bold uppercase">Record Payment</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(PAYMENT_METHOD_META) as PaymentMethod[]).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={cn(
                'border-2 border-black px-2 py-1 text-xs font-bold flex items-center justify-center gap-1',
                method === m ? 'bg-black text-white' : 'bg-white hover:bg-yellow/30'
              )}
            >
              <Icon icon={PAYMENT_METHOD_META[m].icon} className="h-3 w-3" />
              {PAYMENT_METHOD_META[m].label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Reference (optional)"
          className="w-full border-2 border-black px-2 py-1 text-sm"
        />
        <div className="flex gap-2">
          <BrutalistButton
            variant="green"
            onClick={() => markPaidMutation.mutate()}
            loading={markPaidMutation.isPending}
            className="!px-3 !py-1 !text-sm flex-1"
          >
            Confirm
          </BrutalistButton>
          <BrutalistButton
            variant="outline"
            onClick={() => setEditing(false)}
            className="!px-3 !py-1 !text-sm"
          >
            Cancel
          </BrutalistButton>
        </div>
      </div>
    );
  }

  if (isReadOnly) {
    return <span className="text-red font-bold text-sm">UNPAID</span>;
  }

  return (
    <div className="flex gap-2">
      <BrutalistButton
        variant="green"
        onClick={() => setEditing(true)}
        className="!px-3 !py-1 !text-sm"
        icon="majesticons:check"
      >
        Mark Paid
      </BrutalistButton>
      <button
        onClick={() => onTogglePaid(participantId, false)}
        className="text-xs text-gray-400 underline self-center"
      >
        quick
      </button>
    </div>
  );
}
