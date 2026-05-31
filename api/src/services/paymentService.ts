import { db } from '../db/client';
import type { Participant, PaymentConfirmation } from '../types/participant';

export async function addParticipants(
  billId: string,
  participants: Array<{ name: string; phone: string }>
): Promise<Participant[]> {
  const billResult = await db.query('SELECT total_amount FROM bills WHERE id = $1', [billId]);
  
  if (billResult.rows.length === 0) {
    throw new Error('Bill not found');
  }
  
  const existingParticipants = await db.query(
    'SELECT COUNT(*) as count FROM participants WHERE bill_id = $1',
    [billId]
  );
  
  const totalParticipants = parseInt(existingParticipants.rows[0].count) + participants.length;
  const shareAmount = parseFloat((parseFloat(billResult.rows[0].total_amount) / totalParticipants).toFixed(2));
  
  const addedParticipants: Participant[] = [];
  
  for (const participant of participants) {
    const result = await db.query(`
      INSERT INTO participants (bill_id, name, phone, share_amount)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      billId,
      participant.name,
      participant.phone,
      shareAmount,
    ]);

    addedParticipants.push(result.rows[0]);
  }
  
  return addedParticipants;
}

export async function getParticipantsByBillId(billId: string): Promise<Participant[]> {
  const result = await db.query(
    'SELECT * FROM participants WHERE bill_id = $1 ORDER BY created_at',
    [billId]
  );
  
  return result.rows;
}

export async function markAsPaid(participantId: string, confirmedBy?: string): Promise<Participant | null> {
  const result = await db.query(`
    UPDATE participants 
    SET paid = TRUE, paid_at = NOW()
    WHERE id = $1
    RETURNING *
  `, [participantId]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  if (confirmedBy) {
    await db.query(`
      INSERT INTO payment_confirmations (participant_id, confirmed_by)
      VALUES ($1, $2)
    `, [participantId, confirmedBy]);
  }
  
  return result.rows[0];
}

export async function markAsUnpaid(participantId: string): Promise<Participant | null> {
  const result = await db.query(`
    UPDATE participants 
    SET paid = FALSE, paid_at = NULL
    WHERE id = $1
    RETURNING *
  `, [participantId]);
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function confirmPaymentWithCode(
  participantId: string,
  code: string,
  confirmedBy?: string
): Promise<{ success: boolean; participant?: Participant; error?: string }> {
  const participantResult = await db.query(
    'SELECT * FROM participants WHERE id = $1',
    [participantId]
  );
  
  if (participantResult.rows.length === 0) {
    return { success: false, error: 'Participant not found' };
  }
  
  const participant = participantResult.rows[0];
  
  if (participant.confirmation_code !== code) {
    return { success: false, error: 'Invalid confirmation code' };
  }
  
  const updated = await markAsPaid(participantId, confirmedBy);
  
  return { success: true, participant: updated || undefined };
}

export async function getPaymentStats(billId: string) {
  const result = await db.query(`
    SELECT 
      COUNT(*) as total_participants,
      COUNT(CASE WHEN paid = TRUE THEN 1 END) as paid_count,
      COUNT(CASE WHEN paid = FALSE THEN 1 END) as unpaid_count,
      COALESCE(SUM(CASE WHEN paid = TRUE THEN share_amount ELSE 0 END), 0) as collected_amount,
      b.total_amount,
      b.total_amount - COALESCE(SUM(CASE WHEN paid = TRUE THEN share_amount ELSE 0 END), 0) as remaining_amount
    FROM participants p
    JOIN bills b ON p.bill_id = b.id
    WHERE p.bill_id = $1
    GROUP BY b.total_amount
  `, [billId]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const stats = result.rows[0];
  const progressPercentage = stats.total_participants > 0
    ? Math.round((stats.paid_count / stats.total_participants) * 100)
    : 0;
  
  return {
    ...stats,
    progress_percentage: progressPercentage,
  };
}
