import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface AgentContext {
  participantName: string;
  amount: number;
  billTitle: string;
  paid: boolean;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  paymentQrUrl?: string;
  history: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
}

export interface AgentResponse {
  reply: string;
  action?: 'mark_paid' | 'share_qr' | 'request_receipt' | 'none';
  metadata?: Record<string, any>;
}

export interface Agent {
  name: string;
  systemPrompt: string;
  canHandle(context: AgentContext, userMessage: string): boolean;
  respond(userMessage: string, context: AgentContext): Promise<AgentResponse>;
}

export async function callLLM(
  systemPrompt: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: options?.temperature ?? 0.9,
      max_tokens: options?.maxTokens ?? 400,
    });
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API error:', error);
    return '';
  }
}
