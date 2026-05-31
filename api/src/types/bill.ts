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
  share_token: string;
  created_at: string;
  updated_at: string;
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
  participants: Array<{
    name: string;
    email?: string;
    phone?: string;
  }>;
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
  };
}
