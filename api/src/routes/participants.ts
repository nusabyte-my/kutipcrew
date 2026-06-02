import { Hono } from 'hono';
import { z } from 'zod';
import { 
  addParticipants, 
  getParticipantsByBillId, 
  markAsPaid, 
  markAsUnpaid,
  updateParticipant,
  removeParticipant,
} from '../services/paymentService';

const participantSchema = z.object({
  participants: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    share_amount: z.number().positive().optional(),
    share_weight: z.number().positive().optional(),
  })).min(1, 'At least one participant is required'),
});

const updateParticipantSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  share_amount: z.number().positive().optional(),
  share_weight: z.number().positive().optional(),
});

const markPaidSchema = z.object({
  confirmed_by: z.string().optional(),
  payment_method: z.enum(['cash', 'bank_transfer', 'tng', 'duitnow', 'other']).optional(),
  payment_reference: z.string().optional(),
  notes: z.string().optional(),
});

export const participantRoutes = new Hono();

participantRoutes.post('/bills/:billId/participants', async (c) => {
  try {
    const billId = c.req.param('billId');
    const body = await c.req.json();
    const parsed = participantSchema.safeParse(body);
    
    if (!parsed.success) {
      return c.json({ 
        error: 'Validation failed', 
        details: parsed.error.errors 
      }, 400);
    }
    
    const participants = await addParticipants(billId, parsed.data.participants);
    return c.json(participants, 201);
  } catch (error: any) {
    console.error('Error adding participants:', error);
    if (error.message === 'Bill not found') {
      return c.json({ error: 'Bill not found' }, 404);
    }
    return c.json({ error: 'Failed to add participants' }, 500);
  }
});

participantRoutes.get('/bills/:billId/participants', async (c) => {
  try {
    const billId = c.req.param('billId');
    const participants = await getParticipantsByBillId(billId);
    return c.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return c.json({ error: 'Failed to fetch participants' }, 500);
  }
});

participantRoutes.put('/participants/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateParticipantSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
    }

    const participant = await updateParticipant(id, parsed.data);
    if (!participant) {
      return c.json({ error: 'Participant not found' }, 404);
    }
    return c.json(participant);
  } catch (error) {
    console.error('Error updating participant:', error);
    return c.json({ error: 'Failed to update participant' }, 500);
  }
});

participantRoutes.delete('/participants/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const removed = await removeParticipant(id);
    if (!removed) {
      return c.json({ error: 'Participant not found' }, 404);
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('Error removing participant:', error);
    return c.json({ error: 'Failed to remove participant' }, 500);
  }
});

participantRoutes.put('/participants/:id/pay', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const parsed = markPaidSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.errors }, 400);
    }

    const { confirmed_by, payment_method, payment_reference, notes } = parsed.data;
    const participant = await markAsPaid(id, confirmed_by, {
      payment_method,
      payment_reference,
      notes,
    });

    if (!participant) {
      return c.json({ error: 'Participant not found' }, 404);
    }
    return c.json(participant);
  } catch (error) {
    console.error('Error marking as paid:', error);
    return c.json({ error: 'Failed to mark as paid' }, 500);
  }
});

participantRoutes.put('/participants/:id/unpay', async (c) => {
  try {
    const id = c.req.param('id');
    const participant = await markAsUnpaid(id);
    
    if (!participant) {
      return c.json({ error: 'Participant not found' }, 404);
    }
    
    return c.json(participant);
  } catch (error) {
    console.error('Error marking as unpaid:', error);
    return c.json({ error: 'Failed to mark as unpaid' }, 500);
  }
});
