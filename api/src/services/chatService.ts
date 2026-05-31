import { nanoid } from 'nanoid';
import { db } from '../db/client';

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

export function getSession(sessionId: string): ChatSession | undefined {
  return sessions.get(sessionId);
}

export async function createSession(billId: string, participantId: string, participantName: string): Promise<ChatSession> {
  let existing: ChatSession | undefined;
  for (const s of sessions.values()) {
    if (s.billId === billId && s.participantId === participantId) {
      existing = s;
      break;
    }
  }
  if (existing) return existing;

  const historyRows = await db.query(
    'SELECT role, content FROM chat_history WHERE bill_id = $1 AND participant_id = $2 ORDER BY created_at',
    [billId, participantId]
  );

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