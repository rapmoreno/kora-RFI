/**
 * Sad Agents
 * Three levels of sadness: Melancholy (L1), Sorrowful (L2), Depressed (L3)
 */

import type { BaseAgentOptions } from './base-agent.js';
import { BaseAgent } from './base-agent.js';
import type { ChatMessage } from '../types.js';

export class SadLevel1MelancholyAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    await this.ensureInitialized();
    return await this.callGroq(messages);
  }
}

export class SadLevel2SorrowfulAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    await this.ensureInitialized();
    return await this.callGroq(messages);
  }
}

export class SadLevel3DepressedAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    await this.ensureInitialized();
    return await this.callGroq(messages);
  }
}

