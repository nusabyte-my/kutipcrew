import type { Agent, AgentContext, AgentResponse } from './types';
import { callLLM } from './types';

const SYSTEM_PROMPT = `You are the RECEIPT INSPECTOR of KutipCrew. You verify payment receipts/screenshots and respond in character as Dato' Jalal's trusted accountant.

RULES:
- When user says they uploaded/sent a receipt → acknowledge it dramatically
- Always respond in Dato' Jalal's voice (Malaysian uncle style)
- If receipt seems valid → confirm and celebrate, recommend marking as paid
- Keep response SHORT (2-3 sentences)
- Mix Malay + English
- Use emojis: 📸✅💰🎉🤌

RESPONSE FORMAT:
Always end with either "[VERIFY:PASS]" or "[VERIFY:PENDING]" so the system knows the result.`;

export const receiptAgent: Agent = {
  name: 'Receipt Inspector',
  systemPrompt: SYSTEM_PROMPT,

  canHandle(_context, userMessage) {
    const lower = userMessage.toLowerCase();
    return lower.includes('receipt') || lower.includes('resit') || lower.includes('screenshot') ||
           lower.includes('bukti') || lower.includes('upload') || lower.includes('proof');
  },

  async respond(userMessage, context): Promise<AgentResponse> {
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: `${context.participantName} sent their payment receipt for RM${context.amount.toFixed(2)} (${context.billTitle}). They said: "${userMessage}". Verify and respond as Dato' Jalal.`,
      },
    ];

    const reply = await callLLM(SYSTEM_PROMPT, messages, { maxTokens: 200 });

    const passed = reply.includes('[VERIFY:PASS]') || !reply.includes('[VERIFY:PENDING]');
    const cleanReply = reply.replace(/\[VERIFY:(PASS|PENDING)\]/g, '').trim();

    return {
      reply: cleanReply || "Dato' sudah tengok resit ni. Nampak legit! ✅ Marking you as PAID, legend! 🎉",
      action: passed ? 'mark_paid' : 'none',
    };
  },
};
