/**
 * Normal Agent
 * Balanced, professional responses for neutral emotions
 */

import type { BaseAgentOptions } from './base-agent.js';
import { BaseAgent } from './base-agent.js';
import type { ChatMessage } from '../types.js';

export class NormalAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    await this.ensureInitialized();
    return await this.callGroq(messages);
  }
}

