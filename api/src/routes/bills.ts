import { Hono } from 'hono';
import { z } from 'zod';
import {
  createBill,
  getBillById,
  getBillByToken,
  updateBill,
  deleteBill,
  getAllBills,
  getDueBills,
} from '../services/billService';

const billSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).optional(),
  total_amount: z.number().positive('Amount must be positive').max(9999999.99),
  currency: z.string().length(3).optional(),
  organizer_name: z.string().min(1, 'Organizer name is required').max(255),
  organizer_contact: z.string().max(255).optional(),
  bank_name: z.string().max(255).optional(),
  bank_account: z.string().max(255).optional(),
  bank_holder: z.string().max(255).optional(),
  payment_qr_url: z.string().max(2048).optional(),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }).optional(),
  category: z.enum(['food', 'travel', 'utilities', 'rent', 'event', 'shopping', 'subscription', 'other']).optional(),
  tags: z.array(z.string().max(32)).max(20).optional(),
  split_mode: z.enum(['equal', 'custom', 'shares']).optional(),
  participants: z.array(z.object({
    name: z.string().min(1, 'Participant name is required').max(255),
    email: z.string().email().optional(),
    phone: z.string().regex(/^6\d{8,12}$/, 'Phone must be in WhatsApp format: 6XXXXXXXXXX').optional(),
    share_amount: z.number().positive().optional(),
    share_weight: z.number().positive().optional(),
  })).min(1, 'At least one participant is required').max(100),
});

export const billRoutes = new Hono();

billRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = billSchema.safeParse(body);
    
    if (!parsed.success) {
      return c.json({ 
        error: 'Validation failed', 
        details: parsed.error.errors 
      }, 400);
    }
    
    const bill = await createBill(parsed.data);
    return c.json(bill, 201);
  } catch (error) {
    console.error('Error creating bill:', error);
    return c.json({ error: 'Failed to create bill' }, 500);
  }
});

billRoutes.get('/', async (c) => {
  try {
    const dueWithin = c.req.query('due_within');
    if (dueWithin) {
      const days = Math.max(1, Math.min(365, parseInt(dueWithin) || 7));
      const bills = await getDueBills(days);
      return c.json(bills);
    }
    const bills = await getAllBills();
    return c.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return c.json({ error: 'Failed to fetch bills' }, 500);
  }
});

billRoutes.get('/share/:token', async (c) => {
  try {
    const token = c.req.param('token');
    const bill = await getBillByToken(token);
    
    if (!bill) {
      return c.json({ error: 'Bill not found' }, 404);
    }
    
    return c.json(bill);
  } catch (error) {
    console.error('Error fetching bill by token:', error);
    return c.json({ error: 'Failed to fetch bill' }, 500);
  }
});

billRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const bill = await getBillById(id);
    
    if (!bill) {
      return c.json({ error: 'Bill not found' }, 404);
    }
    
    return c.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    return c.json({ error: 'Failed to fetch bill' }, 500);
  }
});

billRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const bill = await updateBill(id, body);
    
    if (!bill) {
      return c.json({ error: 'Bill not found' }, 404);
    }
    
    return c.json(bill);
  } catch (error) {
    console.error('Error updating bill:', error);
    return c.json({ error: 'Failed to update bill' }, 500);
  }
});

billRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const deleted = await deleteBill(id);

    if (!deleted) {
      return c.json({ error: 'Bill not found' }, 404);
    }

    return c.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return c.json({ error: 'Failed to delete bill' }, 500);
  }
});

billRoutes.get('/:id/summary', async (c) => {
  try {
    const id = c.req.param('id');
    const bill = await getBillById(id);
    if (!bill) return c.json({ error: 'Bill not found' }, 404);

    const paid = bill.participants.filter((p) => p.paid);
    const unpaid = bill.participants.filter((p) => !p.paid);
    const topDelinquents = [...unpaid]
      .sort((a, b) => parseFloat(b.share_amount.toString()) - parseFloat(a.share_amount.toString()))
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        name: p.name,
        amount: parseFloat(p.share_amount.toString()),
        days_overdue: bill.stats.days_until_due != null && bill.stats.days_until_due < 0
          ? Math.abs(bill.stats.days_until_due)
          : 0,
      }));

    return c.json({
      id: bill.id,
      title: bill.title,
      organizer: bill.organizer_name,
      currency: bill.currency,
      total_amount: bill.total_amount,
      stats: bill.stats,
      paid_participants: paid.map((p) => ({ id: p.id, name: p.name, paid_at: p.paid_at })),
      unpaid_participants: unpaid.map((p) => ({ id: p.id, name: p.name, phone: p.phone })),
      top_delinquents: topDelinquents,
      recent_activity: bill.recent_activity || [],
    });
  } catch (error) {
    console.error('Error fetching bill summary:', error);
    return c.json({ error: 'Failed to fetch bill summary' }, 500);
  }
});
