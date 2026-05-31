import { Hono } from 'hono';
import { z } from 'zod';
import { 
  createBill, 
  getBillById, 
  getBillByToken, 
  updateBill, 
  deleteBill,
  getAllBills 
} from '../services/billService';

const billSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  total_amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).optional(),
  organizer_name: z.string().min(1, 'Organizer name is required'),
  organizer_contact: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account: z.string().optional(),
  bank_holder: z.string().optional(),
  payment_qr_url: z.string().optional(),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }).optional(),
  participants: z.array(z.object({
    name: z.string().min(1, 'Participant name is required'),
    phone: z.string().regex(/^6\d{8,12}$/, 'Phone must be in WhatsApp format: 6XXXXXXXXXX'),
  })).min(1, 'At least one participant is required'),
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
