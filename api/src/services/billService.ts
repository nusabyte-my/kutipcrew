import { db } from '../db/client';
import { nanoid } from 'nanoid';
import type { Bill, CreateBillInput, BillWithStats } from '../types/bill';
import type { Participant } from '../types/participant';

export async function createBill(input: CreateBillInput): Promise<BillWithStats> {
  const shareToken = nanoid(12);
  const participantCount = input.participants.length;
  const shareAmount = parseFloat((input.total_amount / participantCount).toFixed(2));
  
  return await db.transaction(async (client) => {
    const billResult = await client.query(`
      INSERT INTO bills (title, description, total_amount, currency, organizer_name, organizer_contact, bank_name, bank_account, bank_holder, payment_qr_url, due_date, share_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      input.title,
      input.description || null,
      input.total_amount,
      input.currency || 'MYR',
      input.organizer_name,
      input.organizer_contact || null,
      input.bank_name || null,
      input.bank_account || null,
      input.bank_holder || null,
      input.payment_qr_url || null,
      input.due_date || null,
      shareToken,
    ]);
    
    const bill = billResult.rows[0];
    
    for (const participant of input.participants) {
      const confirmationCode = nanoid(8);
      await client.query(`
        INSERT INTO participants (bill_id, name, phone, share_amount, confirmation_code)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        bill.id,
        participant.name,
        participant.phone,
        shareAmount,
        confirmationCode,
      ]);
    }
    
    const participantsResult = await client.query(
      'SELECT * FROM participants WHERE bill_id = $1 ORDER BY created_at',
      [bill.id]
    );
    
    return {
      ...bill,
      participants: participantsResult.rows,
      stats: calculateStats(bill.total_amount, participantsResult.rows),
    };
  });
}

export async function getBillById(id: string): Promise<BillWithStats | null> {
  const billResult = await db.query('SELECT * FROM bills WHERE id = $1', [id]);
  
  if (billResult.rows.length === 0) {
    return null;
  }
  
  const bill = billResult.rows[0];
  const participantsResult = await db.query(
    'SELECT * FROM participants WHERE bill_id = $1 ORDER BY created_at',
    [id]
  );
  
  return {
    ...bill,
    participants: participantsResult.rows,
    stats: calculateStats(bill.total_amount, participantsResult.rows),
  };
}

export async function getBillByToken(token: string): Promise<BillWithStats | null> {
  const billResult = await db.query('SELECT * FROM bills WHERE share_token = $1', [token]);
  
  if (billResult.rows.length === 0) {
    return null;
  }
  
  const bill = billResult.rows[0];
  const participantsResult = await db.query(
    'SELECT * FROM participants WHERE bill_id = $1 ORDER BY created_at',
    [bill.id]
  );
  
  return {
    ...bill,
    participants: participantsResult.rows,
    stats: calculateStats(bill.total_amount, participantsResult.rows),
  };
}

export async function updateBill(id: string, updates: Partial<CreateBillInput>): Promise<BillWithStats | null> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  
  if (updates.title !== undefined) {
    setClauses.push(`title = $${paramIndex++}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  if (updates.total_amount !== undefined) {
    setClauses.push(`total_amount = $${paramIndex++}`);
    values.push(updates.total_amount);
  }
  if (updates.due_date !== undefined) {
    setClauses.push(`due_date = $${paramIndex++}`);
    values.push(updates.due_date);
  }
  
  if (setClauses.length === 0) {
    return getBillById(id);
  }
  
  setClauses.push(`updated_at = NOW()`);
  values.push(id);
  
  const result = await db.query(
    `UPDATE bills SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return getBillById(id);
}

export async function deleteBill(id: string): Promise<boolean> {
  const result = await db.query('DELETE FROM bills WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function getAllBills(): Promise<BillWithStats[]> {
  const result = await db.query('SELECT * FROM bills ORDER BY created_at DESC');
  
  const bills: BillWithStats[] = [];
  for (const bill of result.rows) {
    const participantsResult = await db.query(
      'SELECT * FROM participants WHERE bill_id = $1 ORDER BY created_at',
      [bill.id]
    );
    
    bills.push({
      ...bill,
      participants: participantsResult.rows,
      stats: calculateStats(bill.total_amount, participantsResult.rows),
    });
  }
  
  return bills;
}

function calculateStats(totalAmount: number, participants: Participant[]) {
  const paidParticipants = participants.filter(p => p.paid);
  const collectedAmount = paidParticipants.reduce((sum, p) => sum + parseFloat(p.share_amount.toString()), 0);
  const remainingAmount = totalAmount - collectedAmount;
  const progressPercentage = participants.length > 0 
    ? Math.round((paidParticipants.length / participants.length) * 100) 
    : 0;
  
  return {
    total_participants: participants.length,
    paid_count: paidParticipants.length,
    unpaid_count: participants.length - paidParticipants.length,
    collected_amount: parseFloat(collectedAmount.toFixed(2)),
    remaining_amount: parseFloat(remainingAmount.toFixed(2)),
    progress_percentage: progressPercentage,
  };
}
