import { Hono } from 'hono';
import { z } from 'zod';
import { confirmPaymentWithCode, getPaymentStats } from '../services/paymentService';

const confirmSchema = z.object({
  participant_id: z.string().uuid(),
  code: z.string().min(1),
  confirmed_by: z.string().optional(),
});

export const paymentRoutes = new Hono();

paymentRoutes.post('/confirm', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = confirmSchema.safeParse(body);
    
    if (!parsed.success) {
      return c.json({ 
        error: 'Validation failed', 
        details: parsed.error.errors 
      }, 400);
    }
    
    const result = await confirmPaymentWithCode(
      parsed.data.participant_id,
      parsed.data.code,
      parsed.data.confirmed_by
    );
    
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }
    
    return c.json(result.participant);
  } catch (error) {
    console.error('Error confirming payment:', error);
    return c.json({ error: 'Failed to confirm payment' }, 500);
  }
});

paymentRoutes.get('/stats/:billId', async (c) => {
  try {
    const billId = c.req.param('billId');
    const stats = await getPaymentStats(billId);
    
    if (!stats) {
      return c.json({ error: 'Bill not found or no participants' }, 404);
    }
    
    return c.json(stats);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return c.json({ error: 'Failed to fetch payment stats' }, 500);
  }
});
