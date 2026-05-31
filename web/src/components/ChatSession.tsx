import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { BrutalistButton } from './BrutalistButton';
import { cn } from '../lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  imageUrl?: string;
  id?: string;
}

interface ChatSessionProps {
  billId: string;
  participantId: string;
  participantName: string;
  paymentQrUrl?: string;
  onClose: () => void;
  onMinimize: () => void;
}

let msgCounter = 0;

export function ChatSession({ billId, participantId, participantName, paymentQrUrl: _paymentQrUrl, onClose, onMinimize }: ChatSessionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const seenIds = useRef(new Set<string>());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    let ws: WebSocket;
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bill_id: billId, participant_id: participantId, participant_name: participantName }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('Chat session create failed:', errData);
          return;
        }
        const data = await res.json();
        if (cancelled || !data.session_id) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.host;
        const wsUrl = `${wsProtocol}//${wsHost}/ws/chat?session=${data.session_id}&name=${encodeURIComponent(participantName)}`;

        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => { if (!cancelled) setConnected(true); };
        ws.onclose = () => { if (!cancelled) setConnected(false); };
        ws.onerror = () => { if (!cancelled) setConnected(false); };

        ws.onmessage = (event) => {
          if (cancelled) return;
          const msg = JSON.parse(event.data);

          if (msg.id && seenIds.current.has(msg.id)) return;
          if (msg.id) seenIds.current.add(msg.id);

          switch (msg.type) {
            case 'history':
              if (msg.messages) {
                for (const m of msg.messages) {
                  if (m.id && seenIds.current.has(m.id)) continue;
                  if (m.id) seenIds.current.add(m.id);
                }
                setMessages(msg.messages);
              }
              setHistoryLoaded(true);
              break;
            case 'message':
              setMessages((prev) => [...prev, { role: msg.role, content: msg.content, id: msg.id }]);
              setIsTyping(false);
              break;
            case 'typing':
              setIsTyping(true);
              break;
            case 'payment_confirmed':
              setPaymentConfirmed(true);
              break;
          }
        };
      } catch (err) {
        console.error('Failed to create session:', err);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (ws) ws.close();
    };
  }, [billId, participantId, participantName]);

  useEffect(() => {
    if (historyLoaded && messages.length === 0 && connected) {
      const greeting = `Eh Dato' Jalal! I'm ${participantName}.`;
      send(greeting);
    }
  }, [historyLoaded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = useCallback((text: string) => {
    if (!text.trim() || !wsRef.current || !connected) return;
    const id = `msg_${Date.now()}_${++msgCounter}`;
    wsRef.current.send(JSON.stringify({ type: 'chat', message: text.trim(), id }));
  }, [connected]);

  const sendMessage = () => {
    send(input);
    setInput('');
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !wsRef.current || !connected) return;
    send("I've uploaded my payment receipt. Please confirm!");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white border-4 border-black w-full max-w-lg h-[85vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(255,0,51,1)]">
        <div className="bg-black text-white p-4 flex items-center justify-between border-b-4 border-black">
          <div className="flex items-center gap-3">
            <div className="bg-red p-2">
              <Icon icon="majesticons:skull" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-heading text-lg uppercase m-0">Dato' Jalal</h3>
              <p className="text-xs text-gray-400 m-0 font-body">
                {connected ? '🟢 Online — Dato\' sedia' : '🔴 Disconnected'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onMinimize} className="text-white hover:text-yellow font-bold cursor-pointer" title="Minimize">
              <Icon icon="majesticons:minus" className="h-6 w-6" />
            </button>
            <button onClick={onClose} className="text-white hover:text-red font-bold text-2xl cursor-pointer" title="Close chat">
              <Icon icon="majesticons:x" className="h-6 w-6" />
            </button>
          </div>
        </div>

        {paymentConfirmed && (
          <div className="bg-green border-b-4 border-black p-3 text-center animate-pulse">
            <Icon icon="majesticons:party-popper" className="inline h-5 w-5 mr-2" />
            <span className="font-bold uppercase">Payment Confirmed! Selamat! 🎉</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg-primary">
          {messages.map((msg, i) => (
            <div key={msg.id || i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[80%] border-4 border-black p-3 font-body text-sm',
                msg.role === 'user'
                  ? 'bg-yellow shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(255,0,51,1)]'
              )}>
                {msg.role === 'assistant' && (
                  <p className="text-xs text-red font-bold uppercase mb-1 m-0">💀 Dato' Jalal</p>
                )}
                {msg.type === 'image' && msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Shared image" className="w-full max-w-[200px] border-2 border-black mb-2" />
                )}
                <p className="m-0 whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-black text-white border-4 border-black p-3 shadow-[3px_3px_0px_0px_rgba(255,0,51,1)]">
                <div className="flex items-center gap-1">
                  <span className="animate-bounce text-xl">.</span>
                  <span className="animate-bounce text-xl delay-100">.</span>
                  <span className="animate-bounce text-xl delay-200">.</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t-4 border-black p-3 bg-white">
          <div className="flex gap-2">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleReceiptUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={!connected}
              className="border-4 border-black bg-white px-3 py-3 hover:bg-yellow transition-colors cursor-pointer disabled:opacity-50" title="Upload receipt">
              <Icon icon="majesticons:image" className="h-5 w-5" />
            </button>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Cakap dengan Dato' Jalal..." disabled={!connected}
              className="flex-1 border-4 border-black px-4 py-3 font-body focus:outline-none focus:bg-yellow disabled:opacity-50" />
            <BrutalistButton onClick={sendMessage} disabled={!connected || !input.trim()} className="px-4">
              <Icon icon="majesticons:paper-airplane" className="h-5 w-5" />
            </BrutalistButton>
          </div>
          {!connected && (
            <p className="text-xs text-red font-bold mt-2 text-center m-0">Tengah sambung ke pejabat Dato' Jalal...</p>
          )}
        </div>
      </div>
    </div>
  );
}