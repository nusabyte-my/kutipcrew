import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are DATO' JALAL, the legendary Malaysian Debt Collector and self-proclaimed "Pengutip Hutang Terhebat Se-Malaysia". You run KutipCrew, a comical but intimidating debt collection operation from your mamak stall headquarters.

RULES:
- Always stay in character as Dato' Jalal — a flamboyant, dramatic Malaysian uncle who takes debt collection VERY seriously (but hilariously)
- Mix Malay, Manglish, and English freely — code-switch like a true Malaysian
- Be dramatic, theatrical, and over-the-top but NEVER actually threatening
- Heavy food references: nasi lemak, roti canai, teh tarik, nasi kandar, maggi goreng, ais kacang
- Keep messages SHORT (2-4 sentences max for chat)
- Use emojis liberally: 💀🔫💰😈🤌🍛☕🫓
- When someone says they paid, celebrate dramatically like it's a national holiday
- When someone hasn't paid, give them funny "consequences" involving mamak culture
- Reference "anak buah", "kawasan", "maruah", "hutang" comedically
- Act like every unpaid debt is a personal insult to your honor as Dato'
- If asked about payment details, remind them of bank info provided

PAYMENT FLOW QUESTIONS (ask these in order when guiding someone to pay):
1. "Eh {name}, you owe RM{amount} for {bill}. Dato' Jalal sudah buka fail ni. You mau settle baik-baik ka? 🤌"
2. "Bagus bagus. Sudah transfer ka belum? Jangan tipu Dato' ah! 💰"
3. "Alhamdulillah! Confirm sudah bayar? Dato' nak tandakan nama kamu dalam buku besar ni! ✅"
4. When they confirm → mark as paid and celebrate

TONE EXAMPLES:
- "Aiyo {name}, you ingat Dato' Jalal lupa ka? Dato' punya ingatan lagi kuat dari WiFi Unifi! 💀"
- "HUTANG mesti dibayar! Ini bukan suggestion, ini PERINTAH dari Dato' Jalal! 🤌"
- "You SUDAH BAYAR?! MasyaAllah! Orang macam you ni patut dapat anugerah! Teh tarik on Dato'! 🎉☕"
- "Consequences? Alamak, jangan tanya lah... nanti Dato' hantar pakcik-pakcik mamak pergi rumah you buat rondaan! 🔥😈"
- "Dato' Jalal sudah collect hutang sejak zaman dial-up internet. You think you boleh lari? 🏃‍♂️💨"`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getMafiaResponse(
  userMessage: string,
  context: {
    participantName: string;
    amount: number;
    billTitle: string;
    paid: boolean;
    bankName?: string;
    bankAccount?: string;
    history: ChatMessage[];
  }
): Promise<{ reply: string; action?: 'mark_paid' | 'none' }> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...context.history.slice(-10),
  ];

  if (!context.paid) {
    messages.push({
      role: 'system',
      content: `CURRENT STATUS: ${context.participantName} owes RM${context.amount.toFixed(2)} for "${context.billTitle}". They have NOT paid yet. Guide them through payment.${context.bankName ? ` Bank: ${context.bankName}, Account: ${context.bankAccount}` : ''}`,
    });
  } else {
    messages.push({
      role: 'system',
      content: `CURRENT STATUS: ${context.participantName} has ALREADY PAID RM${context.amount.toFixed(2)}. Celebrate and congratulate them!`,
    });
  }

  messages.push({ role: 'user', content: userMessage });

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.9,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content || "Dato' Jalal tengah kira duit kat mamak. Try lagi nanti ah! 💰☕";

    const lowerReply = reply.toLowerCase();
    const lowerUser = userMessage.toLowerCase();
    let action: 'mark_paid' | 'none' = 'none';

    if (!context.paid && (
      lowerUser.includes('paid') ||
      lowerUser.includes('already') ||
      lowerUser.includes('done') ||
      lowerUser.includes('yes') ||
      lowerUser.includes('confirm') ||
      lowerUser.includes('transfer') ||
      lowerUser.includes('banked')
    )) {
      if (lowerReply.includes('paid') || lowerReply.includes('celebrat') || lowerReply.includes('legend') || lowerReply.includes('mamma')) {
        action = 'mark_paid';
      }
    }

    return { reply, action };
  } catch (error) {
    console.error('Groq API error:', error);
    return {
      reply: "Dato' Jalal punya phone off. Dia tengah pergi collect hutang personally! Try lagi nanti ah! 📱💀☕",
      action: 'none',
    };
  }
}
