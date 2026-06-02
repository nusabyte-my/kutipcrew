import { Hono } from 'hono';
import { z } from 'zod';
import {
  startWhatsApp,
  stopWhatsApp,
  logoutWhatsApp,
  getQRCode,
  isWhatsAppConnected,
  sendBulkMessages,
} from '../services/whatsappService';
import { getBillById } from '../services/billService';
import { buildPaymentMessage } from '../services/threatMessages';

export const whatsappRoutes = new Hono();

whatsappRoutes.post('/start', async (c) => {
  try {
    await startWhatsApp();
    return c.json({ message: 'WhatsApp initialization started. Check /qr for the QR code.' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

whatsappRoutes.post('/stop', async (c) => {
  try {
    await stopWhatsApp();
    return c.json({ message: 'WhatsApp stopped.' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

whatsappRoutes.post('/logout', async (c) => {
  try {
    await logoutWhatsApp();
    return c.json({ message: 'WhatsApp logged out. Scan QR again to reconnect.' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

whatsappRoutes.get('/status', (c) => {
  return c.json({ connected: isWhatsAppConnected() });
});

whatsappRoutes.get('/qr', async (c) => {
  if (isWhatsAppConnected()) {
    return c.json({ message: 'Already connected!', connected: true });
  }

  if (!getQRCode()) {
    startWhatsApp().catch((err) => console.error('Failed to start WhatsApp for QR:', err));
    await new Promise((r) => setTimeout(r, 2500));
  }

  const qr = getQRCode();
  if (!qr) {
    return c.json({ error: 'QR code not available yet. Try again in a few seconds.', connected: false }, 404);
  }

  return c.json({ qr, connected: isWhatsAppConnected() });
});

const sendSchema = z.object({
  participant_ids: z.array(z.string().uuid()).optional(),
  base_url: z.string().url().optional(),
  delay_ms: z.number().int().min(500).max(10000).optional(),
});

whatsappRoutes.post('/send/:billId', async (c) => {
  try {
    if (!isWhatsAppConnected()) {
      return c.json({ error: 'WhatsApp not connected. POST /api/whatsapp/start first, then scan QR at /api/whatsapp/qr' }, 400);
    }

    const billId = c.req.param('billId');
    const body = await c.req.json().catch(() => ({}));
    const parsed = sendSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
    }

    const { participant_ids, base_url, delay_ms } = parsed.data;

    const bill = await getBillById(billId);
    if (!bill) {
      return c.json({ error: 'Bill not found' }, 404);
    }

    const shareUrl = `${base_url || 'https://kutipcrew.nusabyte.cloud'}/bill/${bill.share_token}`;

    const targets = participant_ids && participant_ids.length > 0
      ? bill.participants.filter((p) => participant_ids.includes(p.id))
      : bill.participants.filter((p) => !p.paid && p.phone);

    if (targets.length === 0) {
      return c.json({ error: 'No participants with phone numbers to message' }, 400);
    }

    const recipients = targets
      .filter((p) => p.phone)
      .map((p) => ({
        phone: p.phone!,
        message: buildPaymentMessage({
          participantName: p.name,
          organizerName: bill.organizer_name,
          billTitle: bill.title,
          amount: parseFloat(p.share_amount.toString()),
          currency: bill.currency,
          bankName: bill.bank_name || undefined,
          bankAccount: bill.bank_account || undefined,
          bankHolder: bill.bank_holder || undefined,
          shareUrl,
          dueDate: bill.due_date || undefined,
          description: bill.description || undefined,
        }),
      }));

    const results = await sendBulkMessages(recipients, { delayMs: delay_ms });

    return c.json({
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      details: results,
    });
  } catch (error: any) {
    console.error('Error sending WhatsApp:', error);
    return c.json({ error: error.message }, 500);
  }
});

const previewSchema = z.object({
  bill_id: z.string().uuid(),
  participant_name: z.string().min(1).optional(),
  base_url: z.string().url().optional(),
});

whatsappRoutes.post('/send-preview', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = previewSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
    }

    const { bill_id, participant_name, base_url } = parsed.data;

    const bill = await getBillById(bill_id);
    if (!bill) {
      return c.json({ error: 'Bill not found' }, 404);
    }

    const shareUrl = `${base_url || 'https://kutipcrew.nusabyte.cloud'}/bill/${bill.share_token}`;

    const message = buildPaymentMessage({
      participantName: participant_name || 'Friend',
      organizerName: bill.organizer_name,
      billTitle: bill.title,
      amount: bill.total_amount / Math.max(bill.participants.length, 1),
      currency: bill.currency,
      bankName: bill.bank_name || undefined,
      bankAccount: bill.bank_account || undefined,
      bankHolder: bill.bank_holder || undefined,
      shareUrl,
      dueDate: bill.due_date || undefined,
      description: bill.description || undefined,
    });

    return c.json({ message });
  } catch (error: any) {
    console.error('Error generating preview:', error);
    return c.json({ error: error.message }, 500);
  }
});
