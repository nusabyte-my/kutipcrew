export interface Participant {
  id: string;
  bill_id: string;
  name: string;
  email?: string;
  phone?: string;
  share_amount: number;
  paid: boolean;
  paid_at?: string;
  confirmation_code?: string;
  created_at: string;
}

export interface CreateParticipantInput {
  name: string;
  email?: string;
  phone?: string;
}

export interface PaymentConfirmation {
  id: string;
  participant_id: string;
  confirmed_by?: string;
  confirmed_at: string;
  notes?: string;
}
