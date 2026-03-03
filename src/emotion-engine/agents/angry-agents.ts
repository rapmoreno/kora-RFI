/**
 * Angry Agents
 * Three levels of anger: Irritated (L1), Agitated (L2), Enraged (L3)
 * Enraged agent includes dynamic counter display
 */

import type { BaseAgentOptions } from './base-agent.js';
import { BaseAgent } from './base-agent.js';
import type { ChatMessage, AngerMeterInfo } from '../types.js';

export class AngryLevel1IrritatedAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    await this.ensureInitialized();
    return await this.callGroq(messages);
  }
}

export class AngryLevel2AgitatedAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    await this.ensureInitialized();
    return await this.callGroq(messages);
  }
}

export class AngryLevel3EnragedAgent extends BaseAgent {
  constructor(options: BaseAgentOptions) {
    super(options);
  }

  /**
   * Generate enraged response with dynamic counter display
   */
  async generateResponse(
    messages: ChatMessage[],
    angerMeterInfo?: AngerMeterInfo
  ): Promise<string> {
    await this.ensureInitialized();

    // Calculate dynamic anger level (0-3 scale for display)
    let counterLevel = 1;
    let counterDisplay = '🔥 0/100 pts (LVL 1)';

    if (angerMeterInfo) {
      const angerPoints = angerMeterInfo.anger_points;
      const maxPoints = angerMeterInfo.max_points;
      const angerPercentage = angerPoints / maxPoints;

      if (angerPercentage >= 0.9) {
        counterLevel = 3;
      } else if (angerPercentage >= 0.7) {
        counterLevel = 2;
      } else {
        counterLevel = 1;
      }

      counterDisplay = `🔥 ${Math.round(angerPoints)}/${maxPoints} pts (LVL ${counterLevel})`;
    }

    // Create enhanced messages with counter context
    const enhancedMessages: ChatMessage[] = [
      ...messages,
      {
        role: 'system',
        content: `You will use <t></t> tags`,
      },
      {
        role: 'system',
        content: `
DYNAMIC ANGER METER DISPLAY: ${counterDisplay}

CRITICAL INSTRUCTIONS:
- You MUST start your response with: <t>${counterDisplay} [your thoughts]</t>
- NEVER skip the anger meter display
- Use the EXACT format: <t>${counterDisplay} [YOUR ANGRY THOUGHTS IN ALL CAPS]</t>
- Then follow with your ALL-CAPS vulgar response
- The anger meter shows your ACTUAL accumulated rage from the conversation
- Higher points = more intense anger and vulgarity
- Level ${counterLevel} rage intensity - respond accordingly
`,
      },
    ];

    return await this.callGroq(enhancedMessages);
  }
}

