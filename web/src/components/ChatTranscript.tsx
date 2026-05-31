import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

interface ChatTranscriptProps {
  billId: string;
  participantId: string;
  participantName: string;
  className?: string;
}

export function ChatTranscript({ billId, participantId, participantName, className }: ChatTranscriptProps) {
  const [open, setOpen] = useState(false);

  const { data: history, isLoading } = useQuery({
    queryKey: ['chat-history', billId, participantId],
    queryFn: () => api.getChatHistory(billId, participantId),
    enabled: open,
  });

  return (
    <div className={cn('border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-black text-white hover:bg-red transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon icon="majesticons:chat" className="h-5 w-5" />
          <span className="font-heading text-sm uppercase">
            {open ? 'Hide' : 'View'} Chat — {participantName}
          </span>
        </div>
        <Icon icon={open ? 'majesticons:chevron-up' : 'majesticons:chevron-down'} className="h-5 w-5" />
      </button>

      {open && (
        <div className="p-4 bg-bg-primary max-h-96 overflow-y-auto space-y-3 border-t-4 border-black">
          {isLoading && (
            <p className="text-center text-sm text-gray-500">Loading chat history...</p>
          )}

          {!isLoading && (!history || history.length === 0) && (
            <p className="text-center text-sm text-gray-500 italic">
              No conversation yet. Click "Chat" to talk with Dato' Jalal!
            </p>
          )}

          {!isLoading && history && history.map((msg, i) => (
            <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[80%] border-4 border-black p-3 font-body text-sm',
                msg.role === 'user'
                  ? 'bg-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(255,0,51,1)]'
              )}>
                {msg.role === 'assistant' && (
                  <p className="text-xs text-red font-bold uppercase mb-1 m-0">💀 Dato' Jalal</p>
                )}
                <p className="m-0 whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {!isLoading && history && history.length > 0 && (
            <p className="text-center text-[10px] text-gray-400 uppercase mt-2 m-0">
              — Conversation History —
            </p>
          )}
        </div>
      )}
    </div>
  );
}