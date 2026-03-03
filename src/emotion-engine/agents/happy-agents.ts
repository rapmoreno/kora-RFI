/**
 * Happy Agents
 * Three levels of happiness: Pleased (L1), Cheerful (L2), Ecstatic (L3)
 */

import type { BaseAgentOptions } from './base-agent.js';
import { BaseAgent } from './base-agent.js';
import type { ChatMessage } from '../types.js';

export class HappyLevel1PleasedAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    await this.ensureInitialized();
    return await this.callGroq(messages);
  }
}

export class HappyLevel2CheerfulAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    await this.ensureInitialized();
    return await this.callGroq(messages);
  }
}

export class HappyLevel3EcstaticAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    await this.ensureInitialized();
    return await this.callGroq(messages);
  }
}

