import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { billRoutes } from './routes/bills';
import { participantRoutes } from './routes/participants';
import { paymentRoutes } from './routes/payments';
import { whatsappRoutes } from './routes/whatsapp';
import { chatRoutes } from './routes/chat';
import { uploadRoutes } from './routes/upload';
import { getSession, persistMessage } from './services/chatService';
import { getBillById } from './services/billService';
import { markAsPaid } from './services/paymentService';
import { orchestrate } from './agents/orchestrator';

const app = new Hono();

app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://kutipcrew.nusabyte.cloud'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type'],
}));

app.use('*', logger());

app.route('/api/bills', billRoutes);
app.route('/api', participantRoutes);
app.route('/api/payments', paymentRoutes);
app.route('/api/whatsapp', whatsappRoutes);
app.route('/api/chat', chatRoutes);
app.route('/api/uploads', uploadRoutes);

app.get('/', (c) => c.json({ message: 'KutipCrew API — We collect so you don\'t have to chase 💀' }));
app.get('/health', (c) => c.json({ status: 'ok' }));

const port = parseInt(process.env.PORT || '3000');

function broadcastToSession(session: any, data: any) {
  const payload = JSON.stringify(data);
  for (const client of session.clients) {
    try {
      if (typeof client.send === 'function') {
        client.send(payload);
      }
    } catch {}
  }
}

function buildContext(session: any, bill: any, participant: any) {
  return {
    participantName: session.participantName,
    amount: parseFloat(participant.share_amount.toString()),
    billTitle: bill.title,
    paid: participant.paid,
    bankName: bill.bank_name || undefined,
    bankAccount: bill.bank_account || undefined,
    bankHolder: bill.bank_holder || undefined,
    paymentQrUrl: bill.payment_qr_url || undefined,
    history: session.history,
  };
}

async function processAgentResponse(session: any, reply: string, action: string | undefined, agentName: string) {
  session.history.push({ role: 'assistant', content: reply });
  broadcastToSession(session, { type: 'message', role: 'assistant', content: reply, agent: agentName });
  await persistMessage(session.billId, session.participantId, 'assistant', reply).catch(() => {});

  if (action === 'share_qr') {
    const bill = await getBillById(session.billId);
    if (bill?.payment_qr_url) {
      const qrMsg = `Ni QR code untuk bayar! Scan dan transfer RM${(bill.total_amount / Math.max(bill.participants.length, 1)).toFixed(2)} 👇`;
      session.history.push({ role: 'assistant', content: qrMsg });
      broadcastToSession(session, { type: 'message', role: 'assistant', content: qrMsg, imageUrl: bill.payment_qr_url, agent: agentName });
    } else if (bill?.bank_account) {
      const bankMsg = `🏦 Bank: ${bill.bank_name || 'N/A'}\n📋 Account: ${bill.bank_account}${bill.bank_holder ? `\n👤 Name: ${bill.bank_holder}` : ''}\n\nTransfer dan hantar resit! 📸`;
      session.history.push({ role: 'assistant', content: bankMsg });
      broadcastToSession(session, { type: 'message', role: 'assistant', content: bankMsg, agent: agentName });
    }
  }

  if (action === 'request_receipt') {
    const receiptMsg = "Eh jangan lupa hantar screenshot/resit bayaran! Tekan button 📷 kat bawah untuk upload. Dato' nak verify dulu! 📸🤌";
    session.history.push({ role: 'assistant', content: receiptMsg });
    broadcastToSession(session, { type: 'message', role: 'assistant', content: receiptMsg, agent: agentName });
  }

  if (action === 'mark_paid') {
    const bill = await getBillById(session.billId);
    const participant = bill?.participants.find((p: any) => p.id === session.participantId);
    if (participant && !participant.paid) {
      try {
        await markAsPaid(session.participantId, `Agent:${agentName}`);
        broadcastToSession(session, {
          type: 'payment_confirmed',
          participantName: session.participantName,
          amount: parseFloat(participant.share_amount.toString()),
        });
        console.log(`✅ ${session.participantName} marked as PAID by ${agentName}!`);
      } catch (err) {
        console.error('Failed to mark as paid:', err);
      }
    }
  }
}

async function handleChatMessage(session: any, userMessage: string, messageId?: string) {
  if (messageId && session._seenMessages?.has(messageId)) {
    return;
  }
  if (messageId) {
    if (!session._seenMessages) session._seenMessages = new Set();
    session._seenMessages.add(messageId);
  }

  session.history.push({ role: 'user', content: userMessage });
  broadcastToSession(session, { type: 'message', role: 'user', content: userMessage, id: messageId });
  await persistMessage(session.billId, session.participantId, 'user', userMessage).catch(() => {});

  const bill = await getBillById(session.billId);
  if (!bill) {
    broadcastToSession(session, { type: 'message', role: 'assistant', content: "Bill sudah hilang dalam void... 💀" });
    return;
  }

  const participant = bill.participants.find((p: any) => p.id === session.participantId);
  if (!participant) {
    broadcastToSession(session, { type: 'message', role: 'assistant', content: "Dato' tak jumpa nama you dalam buku besar. Pelik ni... 🤔" });
    return;
  }

  broadcastToSession(session, { type: 'typing', role: 'assistant' });

  const context = buildContext(session, bill, participant);
  const { reply, action, agentName } = await orchestrate(userMessage, context);

  await processAgentResponse(session, reply, action, agentName);
}

const server = Bun.serve({
  port,
  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === '/ws/chat') {
      const sessionId = url.searchParams.get('session');
      const name = url.searchParams.get('name') || 'Anonymous';

      if (!sessionId || !getSession(sessionId)) {
        return new Response('Session not found', { status: 404 });
      }

      const upgraded = server.upgrade(req, { data: { sessionId, name } });
      if (upgraded) return undefined;
      return new Response('Upgrade failed', { status: 500 });
    }

    return app.fetch(req);
  },
  websocket: {
    open(ws) {
      const { sessionId, name } = ws.data as { sessionId: string; name: string };
      const session = getSession(sessionId);
      if (!session) {
        ws.close(4001, 'Session not found');
        return;
      }

      session.clients.add(ws);
      console.log(`👤 ${name} joined session ${sessionId}`);

      ws.send(JSON.stringify({
        type: 'joined',
        sessionId: session.id,
        participantName: session.participantName,
        messageCount: session.history.length,
      }));

      const nonSystemHistory = session.history.filter((m: any) => m.role !== 'system');
      ws.send(JSON.stringify({ type: 'history', messages: nonSystemHistory }));
    },
    async message(ws, data) {
      try {
        const parsed = JSON.parse(typeof data === 'string' ? data : data.toString());
        if (parsed.type === 'chat' && parsed.message) {
          const { sessionId } = ws.data as { sessionId: string };
          const session = getSession(sessionId);
          if (session) {
            await handleChatMessage(session, parsed.message, parsed.id);
          }
        }
      } catch (err) {
        console.error('Invalid WS message:', err);
      }
    },
    close(ws) {
      const { sessionId } = ws.data as { sessionId: string };
      const session = getSession(sessionId);
      if (session) {
        session.clients.delete(ws);
      }
    },
  },
});

console.log(`💀 KutipCrew API running on port ${port}`);
console.log('🔫 The Crew is assembled. Debts will be collected...');
