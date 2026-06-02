import { db } from '../db/client';
import type { Participant, PaymentConfirmation } from '../types/participant';

export async function addParticipants(
  billId: string,
  participants: Array<{ name: string; phone?: string; email?: string; share_amount?: number; share_weight?: number }>
): Promise<Participant[]> {
  const billResult = await db.query(
    'SELECT total_amount, currency, split_mode FROM bills WHERE id = $1',
    [billId]
  );

  if (billResult.rows.length === 0) {
    throw new Error('Bill not found');
  }

  const bill = billResult.rows[0];
  const existingCount = await db.query(
    'SELECT COUNT(*) as count FROM participants WHERE bill_id = $1',
    [billId]
  );
  const existingTotal = parseInt(existingCount.rows[0].count);
  const newTotal = existingTotal + participants.length;
  const totalAmount = parseFloat(bill.total_amount);
  const splitMode: string = bill.split_mode || 'equal';

  const hasCustomAmounts = participants.some((p) => p.share_amount != null);
  const hasWeights = participants.some((p) => p.share_weight != null);

  let existingWeightsSum = 1;
  if (splitMode === 'shares' || hasWeights) {
    const weightsRes = await db.query(
      'SELECT COALESCE(SUM(COALESCE(share_weight, 1)), 0) as total FROM participants WHERE bill_id = $1',
      [billId]
    );
    existingWeightsSum = parseFloat(weightsRes.rows[0].total) || 1;
  }

  const newWeightsSum = participants.reduce((s, p) => s + (p.share_weight ?? 1), 0);
  const combinedWeights = existingWeightsSum + newWeightsSum;

  const addedParticipants: Participant[] = [];

  for (const participant of participants) {
    let shareAmount: number;

    if (participant.share_amount != null && participant.share_amount > 0) {
      shareAmount = parseFloat(participant.share_amount.toFixed(2));
    } else if (splitMode === 'shares' || hasWeights) {
      shareAmount = parseFloat(((participant.share_weight ?? 1) / combinedWeights * totalAmount).toFixed(2));
    } else {
      shareAmount = parseFloat((totalAmount / newTotal).toFixed(2));
    }

    const result = await db.query(
      `INSERT INTO participants (bill_id, name, phone, email, share_amount, share_weight)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        billId,
        participant.name,
        participant.phone || null,
        participant.email || null,
        shareAmount,
        participant.share_weight ?? 1,
      ]
    );

    addedParticipants.push(result.rows[0]);
  }

  if (!hasCustomAmounts && splitMode === 'equal') {
    await rebalanceEqualShares(billId, totalAmount);
  }

  return addedParticipants;
}

async function rebalanceEqualShares(billId: string, totalAmount: number) {
  const result = await db.query(
    'SELECT id FROM participants WHERE bill_id = $1 ORDER BY created_at',
    [billId]
  );
  if (result.rows.length === 0) return;
  const shareAmount = parseFloat((totalAmount / result.rows.length).toFixed(2));
  await db.query(
    'UPDATE participants SET share_amount = $1 WHERE bill_id = $2',
    [shareAmount, billId]
  );
}

export async function updateParticipant(
  id: string,
  updates: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    share_amount?: number;
    share_weight?: number;
  }
): Promise<Participant | null> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (updates.name !== undefined) { setClauses.push(`name = $${i++}`); values.push(updates.name); }
  if (updates.email !== undefined) { setClauses.push(`email = $${i++}`); values.push(updates.email); }
  if (updates.phone !== undefined) { setClauses.push(`phone = $${i++}`); values.push(updates.phone); }
  if (updates.share_amount !== undefined) { setClauses.push(`share_amount = $${i++}`); values.push(updates.share_amount); }
  if (updates.share_weight !== undefined) { setClauses.push(`share_weight = $${i++}`); values.push(updates.share_weight); }

  if (setClauses.length === 0) {
    const existing = await db.query('SELECT * FROM participants WHERE id = $1', [id]);
    return existing.rows[0] || null;
  }

  values.push(id);
  const result = await db.query(
    `UPDATE participants SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function removeParticipant(id: string): Promise<boolean> {
  const result = await db.query('DELETE FROM participants WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function getParticipantsByBillId(billId: string): Promise<Participant[]> {
  const result = await db.query(
    'SELECT * FROM participants WHERE bill_id = $1 ORDER BY created_at',
    [billId]
  );
  return result.rows;
}

export interface MarkPaidOptions {
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
}

export async function markAsPaid(
  participantId: string,
  confirmedBy?: string,
  options: MarkPaidOptions = {}
): Promise<Participant | null> {
  const { payment_method, payment_reference, notes } = options;

  const result = await db.query(
    `UPDATE participants
     SET paid = TRUE,
         paid_at = NOW(),
         payment_method = COALESCE($2, payment_method),
         payment_reference = COALESCE($3, payment_reference)
     WHERE id = $1
     RETURNING *`,
    [participantId, payment_method || null, payment_reference || null]
  );

  if (result.rows.length === 0) return null;

  if (confirmedBy || payment_method || notes) {
    await db.query(
      `INSERT INTO payment_confirmations (participant_id, confirmed_by, payment_method, notes)
       VALUES ($1, $2, $3, $4)`,
      [participantId, confirmedBy || null, payment_method || null, notes || null]
    );
  }

  return result.rows[0];
}

export async function markAsUnpaid(participantId: string): Promise<Participant | null> {
  const result = await db.query(
    `UPDATE participants
     SET paid = FALSE, paid_at = NULL, payment_method = NULL, payment_reference = NULL
     WHERE id = $1
     RETURNING *`,
    [participantId]
  );
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

  const updated = await markAsPaid(participantId, confirmedBy, {
    notes: 'Code-confirmed',
  });

  return { success: true, participant: updated || undefined };
}

export async function getPaymentHistory(participantId: string): Promise<PaymentConfirmation[]> {
  const result = await db.query(
    `SELECT id, participant_id, confirmed_by, confirmed_at, payment_method, notes
     FROM payment_confirmations
     WHERE participant_id = $1
     ORDER BY confirmed_at DESC`,
    [participantId]
  );
  return result.rows;
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
    total_participants: parseInt(stats.total_participants),
    paid_count: parseInt(stats.paid_count),
    unpaid_count: parseInt(stats.unpaid_count),
    collected_amount: parseFloat(parseFloat(stats.collected_amount).toFixed(2)),
    total_amount: parseFloat(stats.total_amount),
    remaining_amount: parseFloat(parseFloat(stats.remaining_amount).toFixed(2)),
    progress_percentage: progressPercentage,
  };
}