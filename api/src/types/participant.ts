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
  payment_method?: 'cash' | 'bank_transfer' | 'tng' | 'duitnow' | 'other';
  payment_reference?: string;
  confirmation_code?: string;
  created_at: string;
}

export interface CreateParticipantInput {
  name: string;
  email?: string;
  phone?: string;
  share_amount?: number;
  share_weight?: number;
}

export interface PaymentConfirmation {
  id: string;
  participant_id: string;
  confirmed_by?: string;
  confirmed_at: string;
  amount?: number;
  payment_method?: string;
  notes?: string;
}
