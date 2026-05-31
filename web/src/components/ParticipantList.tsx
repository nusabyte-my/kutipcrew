import { Icon } from '@iconify/react';
import { cn, formatCurrency } from '../lib/utils';
import type { Participant } from '../types';

interface ParticipantListProps {
  participants: Participant[];
  currency?: string;
  onTogglePaid?: (participantId: string, currentPaid: boolean) => void;
  readOnly?: boolean;
  className?: string;
}

export function ParticipantList({ 
  participants, 
  currency = 'MYR',
  onTogglePaid,
  readOnly = false,
  className 
}: ParticipantListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {participants.map((participant) => (
        <div 
          key={participant.id}
          className={cn(
            'border-4 border-black p-4 flex items-center justify-between transition-all duration-100',
            participant.paid ? 'bg-green/20' : 'bg-white'
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 border-4 border-black flex items-center justify-center font-bold text-lg',
              participant.paid ? 'bg-green text-black' : 'bg-gray-200 text-gray-500'
            )}>
              {participant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg m-0">{participant.name}</p>
              <p className="text-sm text-gray-600 m-0">
                {formatCurrency(participant.share_amount, currency)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {participant.paid && (
              <div className="flex items-center gap-1 text-green-700 font-bold">
                <Icon icon="majesticons:check-circle" className="h-6 w-6" />
                <span className="hidden sm:inline">PAID</span>
              </div>
            )}
            
            {!participant.paid && (
              <div className="flex items-center gap-1 text-red font-bold">
                <Icon icon="majesticons:x-circle" className="h-6 w-6" />
                <span className="hidden sm:inline">UNPAID</span>
              </div>
            )}

            {!readOnly && onTogglePaid && (
              <button
                onClick={() => onTogglePaid(participant.id, participant.paid)}
                className={cn(
                  'border-4 border-black px-4 py-2 font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 cursor-pointer',
                  participant.paid 
                    ? 'bg-white hover:bg-red hover:text-white' 
                    : 'bg-green hover:bg-black hover:text-green'
                )}
              >
                {participant.paid ? 'Undo' : 'Mark Paid'}
              </button>
            )}
          </div>
        </div>
      ))}

      {participants.length === 0 && (
        <div className="border-4 border-dashed border-gray-400 p-8 text-center text-gray-500">
          <Icon icon="majesticons:users" className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No participants yet. Add some targets!</p>
        </div>
      )}
    </div>
  );
}
