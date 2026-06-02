import { nanoid } from 'nanoid';
import { db } from '../db/client';
import type { BillWithStats } from '../types/bill';

interface ChatSession {
  id: string;
  billId: string;
  participantId: string;
  participantName: string;
  history: Array<{ role: string; content: string }>;
  clients: Set<any>;
  createdAt: Date;
  _seenMessages?: Set<string>;
}

const sessions = new Map<string, ChatSession>();
const billCache = new Map<string, { data: BillWithStats; expiresAt: number }>();
const BILL_CACHE_TTL_MS = 30_000;

export function getSession(sessionId: string): ChatSession | undefined {
  return sessions.get(sessionId);
}

export function getSessionCache(billId: string): BillWithStats | undefined {
  const entry = billCache.get(billId);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    billCache.delete(billId);
    return undefined;
  }
  return entry.data;
}

export function setSessionCache(billId: string, bill: BillWithStats) {
  billCache.set(billId, { data: bill, expiresAt: Date.now() + BILL_CACHE_TTL_MS });
}

export function invalidateBillCache(billId: string) {
  billCache.delete(billId);
}

export async function createSession(billId: string, participantId: string, participantName: string): Promise<ChatSession> {
  for (const s of sessions.values()) {
    if (s.billId === billId && s.participantId === participantId) {
      return s;
    }
  }

  const [historyRows, billResult] = await Promise.all([
    db.query(
      'SELECT role, content FROM chat_history WHERE bill_id = $1 AND participant_id = $2 ORDER BY created_at',
      [billId, participantId]
    ),
    db.query('SELECT * FROM bills WHERE id = $1', [billId]),
  ]);

  if (billResult.rows.length > 0) {
    const participantsResult = await db.query(
      'SELECT * FROM participants WHERE bill_id = $1 ORDER BY created_at',
      [billId]
    );
    const totalAmount = parseFloat(billResult.rows[0].total_amount);
    const participants = participantsResult.rows;
    const paid = participants.filter((p: any) => p.paid);
    const collected = paid.reduce((s: number, p: any) => s + parseFloat(p.share_amount.toString()), 0);
    setSessionCache(billId, {
      ...billResult.rows[0],
      participants,
      stats: {
        total_participants: participants.length,
        paid_count: paid.length,
        unpaid_count: participants.length - paid.length,
        collected_amount: parseFloat(collected.toFixed(2)),
        remaining_amount: parseFloat((totalAmount - collected).toFixed(2)),
        progress_percentage: participants.length > 0 ? Math.round((paid.length / participants.length) * 100) : 0,
        days_until_due: null,
        is_overdue: false,
      },
    });
  }

  const session: ChatSession = {
    id: nanoid(10),
    billId,
    participantId,
    participantName,
    history: historyRows.rows.map((r: any) => ({ role: r.role, content: r.content })),
    clients: new Set(),
    createdAt: new Date(),
  };

  sessions.set(session.id, session);
  console.log(`🎭 Chat session created: ${session.id} for ${participantName} (${historyRows.rows.length} history msgs)`);
  return session;
}

export async function persistMessage(
  billId: string,
  participantId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<void> {
  try {
    await db.query(
      'INSERT INTO chat_history (bill_id, participant_id, role, content) VALUES ($1, $2, $3, $4)',
      [billId, participantId, role, content]
    );
  } catch (err) {
    console.error('Failed to persist chat message:', err);
  }
}

export async function getChatHistory(billId: string, participantId: string) {
  const result = await db.query(
    'SELECT role, content, created_at FROM chat_history WHERE bill_id = $1 AND participant_id = $2 ORDER BY created_at',
    [billId, participantId]
  );
  return result.rows;
}