import { db } from '../db/client';
import { nanoid } from 'nanoid';
import type { Bill, CreateBillInput, BillWithStats, BillActivity } from '../types/bill';
import type { Participant } from '../types/participant';

export async function createBill(input: CreateBillInput): Promise<BillWithStats> {
  const shareToken = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 8) + '-' + nanoid(6);
  const participantCount = input.participants.length;
  const totalAmount = input.total_amount;
  const splitMode = input.split_mode ?? 'equal';

  let shareAmount: number;
  const weights = input.participants.map((p) => p.share_weight ?? 1);
  const totalWeight = weights.reduce((s, w) => s + w, 0) || 1;

  if (splitMode === 'equal') {
    shareAmount = parseFloat((totalAmount / participantCount).toFixed(2));
  } else if (splitMode === 'shares') {
    shareAmount = parseFloat((totalAmount / totalWeight).toFixed(2));
  } else {
    shareAmount = 0;
  }

  return await db.transaction(async (client) => {
    const billResult = await client.query(
      `INSERT INTO bills (
        title, description, total_amount, currency, organizer_name, organizer_contact,
        bank_name, bank_account, bank_holder, payment_qr_url, due_date, share_token,
        category, tags, split_mode
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
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
        input.category || 'other',
        input.tags || [],
        splitMode,
      ]
    );

    const bill = billResult.rows[0];

    for (let i = 0; i < input.participants.length; i++) {
      const participant = input.participants[i];
      const confirmationCode = nanoid(8);

      let amount: number;
      if (participant.share_amount != null && participant.share_amount > 0) {
        amount = parseFloat(participant.share_amount.toFixed(2));
      } else if (splitMode === 'shares') {
        amount = parseFloat(((participant.share_weight ?? weights[i]) / totalWeight * totalAmount).toFixed(2));
      } else {
        amount = shareAmount;
      }

      await client.query(
        `INSERT INTO participants (bill_id, name, phone, email, share_amount, share_weight, confirmation_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          bill.id,
          participant.name,
          participant.phone || null,
          participant.email || null,
          amount,
          participant.share_weight ?? 1,
          confirmationCode,
        ]
      );
    }

    const participantsResult = await client.query(
      'SELECT * FROM participants WHERE bill_id = $1 ORDER BY created_at',
      [bill.id]
    );

    return buildBillWithStats(bill, participantsResult.rows);
  });
}

export async function getBillById(id: string): Promise<BillWithStats | null> {
  const billResult = await db.query('SELECT * FROM bills WHERE id = $1', [id]);
  if (billResult.rows.length === 0) return null;
  return getBillWithRelations(billResult.rows[0]);
}

export async function getBillByToken(token: string): Promise<BillWithStats | null> {
  const billResult = await db.query('SELECT * FROM bills WHERE share_token = $1', [token]);
  if (billResult.rows.length === 0) return null;
  return getBillWithRelations(billResult.rows[0]);
}

async function getBillWithRelations(bill: Bill): Promise<BillWithStats> {
  const participantsResult = await db.query(
    'SELECT * FROM participants WHERE bill_id = $1 ORDER BY created_at',
    [bill.id]
  );
  return buildBillWithStats(bill, participantsResult.rows);
}

async function buildBillWithStats(bill: Bill, participants: Participant[]): Promise<BillWithStats> {
  const stats = calculateStats(bill.total_amount, participants, bill.due_date);
  const recent_activity = await getRecentActivity(bill.id, participants, 10);
  return {
    ...bill,
    participants,
    stats,
    recent_activity,
  };
}

export async function updateBill(id: string, updates: Partial<CreateBillInput>): Promise<BillWithStats | null> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let i = 1;

  const allowed: Array<keyof CreateBillInput> = [
    'title', 'description', 'total_amount', 'organizer_name', 'organizer_contact',
    'bank_name', 'bank_account', 'bank_holder', 'payment_qr_url', 'due_date',
    'category', 'tags', 'currency',
  ];

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      setClauses.push(`${key} = $${i++}`);
      values.push(updates[key]);
    }
  }

  if (setClauses.length === 0) {
    return getBillById(id);
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await db.query(
    `UPDATE bills SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );

  if (result.rows.length === 0) return null;
  return getBillWithRelations(result.rows[0]);
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
      stats: calculateStats(bill.total_amount, participantsResult.rows, bill.due_date),
    });
  }

  return bills;
}

export async function getDueBills(withinDays = 7): Promise<BillWithStats[]> {
  const result = await db.query(
    `SELECT * FROM bills
     WHERE due_date IS NOT NULL
     AND due_date <= (NOW() + ($1 || ' days')::interval)
     AND due_date >= NOW() - interval '30 days'
     ORDER BY due_date ASC`,
    [String(withinDays)]
  );
  const bills: BillWithStats[] = [];
  for (const bill of result.rows) {
    const participantsResult = await db.query(
      'SELECT * FROM participants WHERE bill_id = $1 ORDER BY created_at',
      [bill.id]
    );
    bills.push({
      ...bill,
      participants: participantsResult.rows,
      stats: calculateStats(bill.total_amount, participantsResult.rows, bill.due_date),
    });
  }
  return bills;
}

async function getRecentActivity(
  billId: string,
  participants: Participant[],
  limit = 10
): Promise<BillActivity[]> {
  const activities: BillActivity[] = [];

  activities.push({
    type: 'created',
    actor: 'organizer',
    notes: 'Bill created',
    created_at: participants[0]?.created_at || new Date().toISOString(),
  });

  for (const p of participants) {
    if (p.paid && p.paid_at) {
      activities.push({
        type: 'paid',
        participant_id: p.id,
        participant_name: p.name,
        amount: parseFloat(p.share_amount.toString()),
        created_at: p.paid_at,
      });
    }
  }

  activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return activities.slice(0, limit);
}

function calculateStats(totalAmount: number, participants: Participant[], dueDate?: string) {
  const paidParticipants = participants.filter((p) => p.paid);
  const collectedAmount = paidParticipants.reduce(
    (sum, p) => sum + parseFloat(p.share_amount.toString()),
    0
  );
  const remainingAmount = totalAmount - collectedAmount;
  const progressPercentage =
    participants.length > 0
      ? Math.round((paidParticipants.length / participants.length) * 100)
      : 0;

  let daysUntilDue: number | null = null;
  let isOverdue = false;
  if (dueDate) {
    const due = new Date(dueDate);
    const now = new Date();
    daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    isOverdue = daysUntilDue < 0;
  }

  return {
    total_participants: participants.length,
    paid_count: paidParticipants.length,
    unpaid_count: participants.length - paidParticipants.length,
    collected_amount: parseFloat(collectedAmount.toFixed(2)),
    remaining_amount: parseFloat(remainingAmount.toFixed(2)),
    progress_percentage: progressPercentage,
    days_until_due: daysUntilDue,
    is_overdue: isOverdue,
  };
}
