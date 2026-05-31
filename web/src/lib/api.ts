import type { BillWithStats, CreateBillInput, Participant, BillStats } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  createBill: (data: CreateBillInput) =>
    fetchAPI<BillWithStats>('/api/bills', { method: 'POST', body: JSON.stringify(data) }),

  getBill: (id: string) =>
    fetchAPI<BillWithStats>(`/api/bills/${id}`),

  getBillByToken: (token: string) =>
    fetchAPI<BillWithStats>(`/api/bills/share/${token}`),

  getAllBills: () =>
    fetchAPI<BillWithStats[]>('/api/bills'),

  updateBill: (id: string, data: Partial<CreateBillInput>) =>
    fetchAPI<BillWithStats>(`/api/bills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteBill: (id: string) =>
    fetchAPI<{ message: string }>(`/api/bills/${id}`, { method: 'DELETE' }),

  addParticipants: (billId: string, participants: Array<{ name: string; email?: string; phone?: string }>) =>
    fetchAPI<Participant[]>(`/api/bills/${billId}/participants`, { 
      method: 'POST', 
      body: JSON.stringify({ participants }) 
    }),

  getParticipants: (billId: string) =>
    fetchAPI<Participant[]>(`/api/bills/${billId}/participants`),

  markAsPaid: (participantId: string, confirmedBy?: string) =>
    fetchAPI<Participant>(`/api/participants/${participantId}/pay`, {
      method: 'PUT',
      body: JSON.stringify({ confirmed_by: confirmedBy }),
    }),

  markAsUnpaid: (participantId: string) =>
    fetchAPI<Participant>(`/api/participants/${participantId}/unpay`, { method: 'PUT' }),

  confirmPayment: (participantId: string, code: string, confirmedBy?: string) =>
    fetchAPI<Participant>('/api/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ participant_id: participantId, code, confirmed_by: confirmedBy }),
    }),

  getPaymentStats: (billId: string) =>
    fetchAPI<BillStats>(`/api/payments/stats/${billId}`),

  getChatHistory: (billId: string, participantId: string) =>
    fetchAPI<Array<{ role: string; content: string; created_at: string }>>(
      `/api/chat/bill/${billId}/participant/${participantId}`
    ),

  startWhatsApp: () =>
    fetchAPI<{ message: string }>('/api/whatsapp/start', { method: 'POST' }),

  getWhatsAppStatus: () =>
    fetchAPI<{ connected: boolean }>('/api/whatsapp/status'),

  getWhatsAppQR: () =>
    fetchAPI<{ qr: string; connected: boolean }>('/api/whatsapp/qr'),

  sendWhatsAppThreats: (billId: string, participantIds?: string[]) =>
    fetchAPI<{ sent: number; failed: number; details: Array<{ phone: string; success: boolean; error?: string }> }>(
      `/api/whatsapp/send/${billId}`,
      { method: 'POST', body: JSON.stringify({ participant_ids: participantIds, base_url: window.location.origin }) }
    ),

  uploadQR: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/uploads`, { method: 'POST', body: formData });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `Upload error: ${res.status}`);
    }
    return res.json();
  },

  previewThreatMessage: (billId: string, participantName: string) =>
    fetchAPI<{ message: string }>('/api/whatsapp/send-preview', {
      method: 'POST',
      body: JSON.stringify({ bill_id: billId, participant_name: participantName, base_url: window.location.origin }),
    }),
};
