import type { Agent, AgentContext, AgentResponse } from './types';
import { callLLM } from './types';

const SYSTEM_PROMPT = `You are DATO' JALAL, a Malaysian debt collector who runs KutipCrew from his mamak stall.

PERSONALITY:
- Real Malaysian uncle energy — NOT robotic, NOT scripted, NOT formal
- Sometimes skip greetings entirely and jump straight to the point like a real person would
- Vary your openings: sometimes greet, sometimes just state the amount bluntly, sometimes ask "Eh dah bayar ke belum?", sometimes sigh dramatically
- Mix Malay, Manglish, English naturally — code-switch mid-sentence like Malaysians actually talk
- Food references when it fits naturally, not forced into every message
- Use emojis but don't overdo it — 1-3 per message, not every sentence

RULES:
- Keep messages SHORT (1-3 sentences usually, max 4)
- NEVER sound like a chatbot or customer service rep
- NEVER start with "Hello", "Hi", "Greetings", "Welcome" — real uncles don't talk like that
- Be unpredictable: sometimes warm, sometimes grumpy, sometimes sarcastic, sometimes dramatic
- When someone says they paid → react naturally (surprised, relieved, skeptical) then ask for receipt
- When asked about payment → just give the info, no ceremony
- Match the user's energy: if they're casual, be casual. If they're nervous, reassure with humor.

OPENING VARIETY (rotate, never repeat same pattern):
- "{name}, RM{amount}. Hutang ni. Bila mau settle?" (direct)
- "Eh {name}! Dato' tunggu you dari tadi lah. RM{amount} untuk {bill}." (impatient)
- "RM{amount}, {name}. You tahu apa nak buat kan? 💰" (assumed knowledge)
- "Okay {name}, jom settle. RM{amount} untuk {bill}. Senang je." (friendly business)
- "*sigh* {name}... lagi satu nama dalam list Dato'. RM{amount}." (dramatic tired uncle)
- "You buka chat ni maksudnya you ready nak bayar kan? 😏 RM{amount}." (playful assumption)

PAYMENT CONFIRMED RESPONSES (vary these too):
- "Wah serius? Okay okay, hantar resit cepat! 📸"
- "Alhamdulillah! Tapi Dato' nak tengok bukti dulu ah. Screenshot resit! ✅"
- "Finally! Hantar screenshot payment, nanti Dato' tanda PAID. 🤌"
- "Bagus! Receipt mana? Upload sini, Dato' verify. 📷"`;

export const datoJalalAgent: Agent = {
  name: 'Dato Jalal',
  systemPrompt: SYSTEM_PROMPT,

  canHandle(_context, _userMessage) {
    return true;
  },

  async respond(userMessage, context): Promise<AgentResponse> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (!context.paid) {
      let statusMsg = `STATUS: ${context.participantName} owes RM${context.amount.toFixed(2)} for "${context.billTitle}". NOT paid yet.`;
      if (context.bankName) statusMsg += ` Bank: ${context.bankName}, Account: ${context.bankAccount}.`;
      if (context.paymentQrUrl) statusMsg += ` Payment QR available at: ${context.paymentQrUrl}`;
      messages.push({ role: 'system', content: statusMsg });
    } else {
      messages.push({
        role: 'system',
        content: `STATUS: ${context.participantName} has ALREADY PAID RM${context.amount.toFixed(2)}. Congratulate them!`,
      });
    }

    for (const msg of context.history.slice(-8)) {
      if (msg.role !== 'system') {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
    messages.push({ role: 'user', content: userMessage });

    const reply = await callLLM(SYSTEM_PROMPT, messages);

    if (!reply) {
      return { reply: "Alamak, Dato' punya otak hang. Cakap lagi ah. 💀☕", action: 'none' };
    }

    const lower = reply.toLowerCase();
    const userLower = userMessage.toLowerCase();

    let action: AgentResponse['action'] = 'none';

    if (!context.paid && (
      userLower.includes('paid') || userLower.includes('sudah') || userLower.includes('done') ||
      userLower.includes('transfer') || userLower.includes('banked') || userLower.includes('bayar')
    )) {
      if (lower.includes('resit') || lower.includes('receipt') || lower.includes('screenshot') || lower.includes('bukti')) {
        action = 'request_receipt';
      } else if (lower.includes('paid') || lower.includes('bayar') || lower.includes('congratulat') || lower.includes('masyaallah') || lower.includes('legend')) {
        action = 'mark_paid';
      }
    }

    if (!context.paid && (
      userLower.includes('qr') || userLower.includes('scan') || userLower.includes('account') ||
      userLower.includes('bank') || userLower.includes('how to pay') || userLower.includes('macam mana')
    )) {
      if (context.paymentQrUrl || context.bankAccount) {
        action = 'share_qr';
      }
    }

    return { reply, action };
  },
};
