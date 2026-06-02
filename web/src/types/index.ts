export type BillCategory = 'food' | 'travel' | 'utilities' | 'rent' | 'event' | 'shopping' | 'subscription' | 'other';

export type SplitMode = 'equal' | 'custom' | 'shares';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'tng' | 'duitnow' | 'other';

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
  split_mode: SplitMode;
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  bill_id: string;
  name: string;
  email?: string;
  phone?: string;
  share_amount: number;
  share_weight?: number;
  paid: boolean;
  paid_at?: string;
  payment_method?: PaymentMethod;
  payment_reference?: string;
  confirmation_code?: string;
  created_at: string;
}

export interface BillStats {
  total_participants: number;
  paid_count: number;
  unpaid_count: number;
  collected_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  days_until_due?: number | null;
  is_overdue?: boolean;
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
  stats: BillStats;
  recent_activity?: BillActivity[];
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
  split_mode?: SplitMode;
  participants: Array<{
    name: string;
    email?: string;
    phone?: string;
    share_amount?: number;
    share_weight?: number;
  }>;
}

export interface BillSummary {
  id: string;
  title: string;
  organizer: string;
  currency: string;
  total_amount: number;
  stats: BillStats;
  paid_participants: Array<{ id: string; name: string; paid_at?: string }>;
  unpaid_participants: Array<{ id: string; name: string; phone?: string }>;
  top_delinquents: Array<{ id: string; name: string; amount: number; days_overdue: number }>;
  recent_activity: BillActivity[];
}

export const CATEGORY_META: Record<BillCategory, { label: string; icon: string; color: string }> = {
  food: { label: 'Food & Makan', icon: 'majesticons:food', color: 'bg-orange' },
  travel: { label: 'Travel', icon: 'majesticons:plane', color: 'bg-blue' },
  utilities: { label: 'Utilities', icon: 'majesticons:bulb', color: 'bg-yellow' },
  rent: { label: 'Rent & Housing', icon: 'majesticons:home', color: 'bg-purple' },
  event: { label: 'Event & Party', icon: 'majesticons:confetti', color: 'bg-pink' },
  shopping: { label: 'Shopping', icon: 'majesticons:shopping-bag', color: 'bg-cyan' },
  subscription: { label: 'Subscription', icon: 'majesticons:repeat', color: 'bg-green' },
  other: { label: 'Other', icon: 'majesticons:clipboard', color: 'bg-gray-300' },
};