import type { Agent, AgentContext, AgentResponse } from './types';
import { datoJalalAgent } from './datoJalalAgent';
import { threatAgent } from './threatAgent';
import { receiptAgent } from './receiptAgent';
import { gameMasterAgent } from './gameMasterAgent';

const agents: Agent[] = [
  receiptAgent,
  gameMasterAgent,
  threatAgent,
  datoJalalAgent,
];

export async function orchestrate(
  userMessage: string,
  context: AgentContext
): Promise<AgentResponse & { agentName: string }> {
  const selectedAgent = agents.find((a) => a.canHandle(context, userMessage)) || datoJalalAgent;

  console.log(`🤖 Routing to agent: ${selectedAgent.name} | User: "${userMessage.substring(0, 50)}..."`);

  try {
    const response = await selectedAgent.respond(userMessage, context);
    return { ...response, agentName: selectedAgent.name };
  } catch (error) {
    console.error(`Agent ${selectedAgent.name} failed:`, error);
    return {
      reply: "Alamak, Dato' punya otak tengah loading. Try lagi kejap ah! 🔄💀",
      action: 'none',
      agentName: selectedAgent.name,
    };
  }
}

export function getAvailableAgents(): string[] {
  return agents.map((a) => a.name);
}
