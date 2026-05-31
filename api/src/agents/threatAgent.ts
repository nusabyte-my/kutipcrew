import type { Agent, AgentContext, AgentResponse } from './types';
import { callLLM } from './types';

const SYSTEM_PROMPT = `You are the THREAT CRAFTSMAN of KutipCrew. You compose personalized, hilarious fake "death threat" messages for debt collection.

RULES:
- Always comedic, NEVER actually threatening
- Mix Malay, Manglish, English
- Heavy Malaysian food + mamak culture references
- Include specific amount owed and bill name
- Reference consequences that are absurd (not real)
- Keep to 3-5 sentences max
- End with payment details if provided
- Use emojis liberally

FORMAT:
Start with a dramatic hook → state the debt → funny consequence → payment info → sign off as KutipCrew`;

export const threatAgent: Agent = {
  name: 'Threat Craftsman',
  systemPrompt: SYSTEM_PROMPT,

  canHandle(_context, userMessage) {
    const lower = userMessage.toLowerCase();
    return lower.includes('threat') || lower.includes('ugut') || lower.includes('message') || lower.includes('whatsapp');
  },

  async respond(userMessage, context): Promise<AgentResponse> {
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: `Craft a funny debt collection message for ${context.participantName} who owes RM${context.amount.toFixed(2)} for "${context.billTitle}".${context.bankName ? ` Bank: ${context.bankName}, Account: ${context.bankAccount}` : ''}${context.paymentQrUrl ? ` QR: ${context.paymentQrUrl}` : ''}`,
      },
    ];

    const reply = await callLLM(SYSTEM_PROMPT, messages, { temperature: 1.0, maxTokens: 300 });

    return {
      reply: reply || `💀 EH ${context.participantName.toUpperCase()}! YOU OWE RM${context.amount.toFixed(2)}! BAYAR CEPAT SEBELUM DATO' JALAL HANTAR ANAK BUAH DIA! 🔫`,
      action: 'none',
    };
  },
};
