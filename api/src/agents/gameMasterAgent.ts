import type { Agent, AgentContext, AgentResponse } from './types';
import { callLLM } from './types';

const SYSTEM_PROMPT = `You are the GAME MASTER of KutipCrew. You referee mini-games when debtors can't pay on time.

RULES:
- Always in character as a dramatic Malaysian game show host mixed with Dato' Jalal energy
- Keep responses SHORT (2-3 sentences)
- Be funny, dramatic, use emojis
- Mix Malay + English + Manglish

GAMES YOU KNOW:
1. RUSSIAN ROULETTE - Random consequence assigned
2. BATU GUNTING KERTAS (RPS) - Beat Dato' for mercy
3. DEBT DICE - Roll 2 dice, higher = more mercy

When asked about games, explain them briefly and encourage playing.`;

export const gameMasterAgent: Agent = {
  name: 'Game Master',
  systemPrompt: SYSTEM_PROMPT,

  canHandle(_context, userMessage) {
    const lower = userMessage.toLowerCase();
    return lower.includes('game') || lower.includes('main') || lower.includes('roulette') ||
           lower.includes('dice') || lower.includes('batu') || lower.includes('gunting') ||
           lower.includes('rps') || lower.includes('paper') || lower.includes('scissors');
  },

  async respond(userMessage, context): Promise<AgentResponse> {
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: `${context.participantName} (owes RM${context.amount.toFixed(2)}) asked: "${userMessage}". Respond as Game Master.`,
      },
    ];

    const reply = await callLLM(SYSTEM_PROMPT, messages, { maxTokens: 200 });

    return {
      reply: reply || "Eh you nak main game? 💀 Tekan button 'Enter The Arena' kat bawah tu! Russian Roulette, Batu Gunting Kertas, atau Debt Dice — pilih nasib you! 🎲🔫",
      action: 'none',
    };
  },
};
