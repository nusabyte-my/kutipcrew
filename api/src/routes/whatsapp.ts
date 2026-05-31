import { Hono } from 'hono';
import { 
  startWhatsApp, 
  getQRCode, 
  isWhatsAppConnected, 
  sendWhatsAppMessage,
  sendBulkMessages 
} from '../services/whatsappService';
import { getBillById, getBillByToken } from '../services/billService';
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

whatsappRoutes.get('/status', (c) => {
  return c.json({ connected: isWhatsAppConnected() });
});

whatsappRoutes.get('/qr', async (c) => {
  if (!getQRCode()) {
    if (isWhatsAppConnected()) {
      return c.json({ message: 'Already connected!', connected: true });
    }
    await startWhatsApp();
    await new Promise((r) => setTimeout(r, 3000));
  }

  const qr = getQRCode();
  if (!qr) {
    return c.json({ error: 'QR code not available yet. Try again in a few seconds.' }, 404);
  }

  return c.json({ qr, connected: isWhatsAppConnected() });
});

whatsappRoutes.post('/send/:billId', async (c) => {
  try {
    if (!isWhatsAppConnected()) {
      return c.json({ error: 'WhatsApp not connected. POST /api/whatsapp/start first, then scan QR at /api/whatsapp/qr' }, 400);
    }

    const billId = c.req.param('billId');
    const body = await c.req.json().catch(() => ({}));
    const participantIds: string[] | undefined = body.participant_ids;

    const bill = await getBillById(billId);
    if (!bill) {
      return c.json({ error: 'Bill not found' }, 404);
    }

    const shareUrl = `${body.base_url || 'https://kutipcrew.nusabyte.cloud'}/bill/${bill.share_token}`;

    const targets = participantIds
      ? bill.participants.filter((p) => participantIds.includes(p.id))
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
        }),
      }));

    const results = await sendBulkMessages(recipients);

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

whatsappRoutes.post('/send-preview', async (c) => {
  try {
    const body = await c.req.json();
    const { bill_id, participant_name, base_url } = body;

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
    });

    return c.json({ message });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
