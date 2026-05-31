import { Hono } from 'hono';
import { createSession, getSession, getChatHistory } from '../services/chatService';
import { getBillById } from '../services/billService';

export const chatRoutes = new Hono();

chatRoutes.post('/sessions', async (c) => {
  try {
    const body = await c.req.json();
    const { bill_id, participant_id, participant_name } = body;

    if (!bill_id || !participant_id || !participant_name) {
      return c.json({ error: 'bill_id, participant_id, and participant_name are required' }, 400);
    }

    const bill = await getBillById(bill_id);
    if (!bill) {
      return c.json({ error: 'Bill not found' }, 404);
    }

    const session = createSession(bill_id, participant_id, participant_name);

    return c.json({
      session_id: session.id,
      participant_name: session.participantName,
      ws_url: `/ws/chat?session=${session.id}&name=${encodeURIComponent(participant_name)}`,
    }, 201);
  } catch (error: any) {
    console.error('Error creating chat session:', error);
    return c.json({ error: error.message }, 500);
  }
});

chatRoutes.get('/sessions/:sessionId', (c) => {
  const sessionId = c.req.param('sessionId');
  const session = getSession(sessionId);

  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  return c.json({
    session_id: session.id,
    bill_id: session.billId,
    participant_name: session.participantName,
    active_clients: session.clients.size,
    message_count: session.history.length,
    created_at: session.createdAt,
  });
});

chatRoutes.get('/bill/:billId/participants', async (c) => {
  const billId = c.req.param('billId');
  const bill = await getBillById(billId);

  if (!bill) {
    return c.json({ error: 'Bill not found' }, 404);
  }

  const sessionIds = bill.participants.map((p) => {
    return {
      participant_id: p.id,
      participant_name: p.name,
      paid: p.paid,
    };
  });

  return c.json(sessionIds);
});

chatRoutes.get('/bill/:billId/participant/:participantId', async (c) => {
  const billId = c.req.param('billId');
  const participantId = c.req.param('participantId');

  try {
    const history = await getChatHistory(billId, participantId);
    return c.json(history);
  } catch {
    return c.json([]);
  }
});