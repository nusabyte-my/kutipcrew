import type { Participant } from './participant';

export type BillCategory = 'food' | 'travel' | 'utilities' | 'rent' | 'event' | 'shopping' | 'subscription' | 'other';

export interface Bill {
  id: string;
  title: string;
  description?: string;
  total_amount: number;
  currency: string;
  organizer_name: string;
  organizer_contact?: string;
  bank_name?: string;
  bank_account?: string;
  bank_holder?: string;
  payment_qr_url?: string;
  due_date?: string;
  category?: BillCategory;
  tags?: string[];
  split_mode: 'equal' | 'custom' | 'shares';
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface ParticipantShare {
  name: string;
  email?: string;
  phone?: string;
  share_amount?: number;
  share_weight?: number;
}

export interface CreateBillInput {
  title: string;
  description?: string;
  total_amount: number;
  currency?: string;
  organizer_name: string;
  organizer_contact?: string;
  bank_name?: string;
  bank_account?: string;
  bank_holder?: string;
  payment_qr_url?: string;
  due_date?: string;
  category?: BillCategory;
  tags?: string[];
  split_mode?: 'equal' | 'custom' | 'shares';
  participants: Array<ParticipantShare>;
}

export interface BillActivity {
  type: 'created' | 'paid' | 'unpaid' | 'message' | 'whatsapp_sent' | 'updated';
  participant_id?: string;
  participant_name?: string;
  amount?: number;
  actor?: string;
  notes?: string;
  created_at: string;
}

export interface BillWithStats extends Bill {
  participants: Participant[];
  stats: {
    total_participants: number;
    paid_count: number;
    unpaid_count: number;
    collected_amount: number;
    remaining_amount: number;
    progress_percentage: number;
    days_until_due?: number | null;
    is_overdue?: boolean;
  };
  recent_activity?: BillActivity[];
}
