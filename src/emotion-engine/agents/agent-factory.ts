/**
 * Agent Factory
 * Creates agents by name. Registry required - no fallback.
 * Throws if agent not in agents/registry.yaml.
 */

import type { AgentType } from '../types.js';
import { getAgentConfig } from '../utils/registry-loader.js';
import { BaseAgent } from './base-agent.js';
import { SentimentAgent } from './sentiment-agent.js';
import { NormalAgent } from './normal-agent.js';
import {
  HappyLevel1PleasedAgent,
  HappyLevel2CheerfulAgent,
  HappyLevel3EcstaticAgent,
} from './happy-agents.js';
import {
  SadLevel1MelancholyAgent,
  SadLevel2SorrowfulAgent,
  SadLevel3DepressedAgent,
} from './sad-agents.js';
import {
  AngryLevel1IrritatedAgent,
  AngryLevel2AgitatedAgent,
  AngryLevel3EnragedAgent,
} from './angry-agents.js';

type AgentInstance = BaseAgent | SentimentAgent;

export class AgentFactory {
  private agents: Map<string, AgentInstance> = new Map();
  private clientName?: string;

  constructor(clientName?: string) {
    this.clientName = clientName || process.env.CLIENT_NAME || 'synapse';
  }

  /**
   * Get or create an agent by name. Throws if agent not in registry.
   */
  async getAgent(agentName: string): Promise<AgentInstance> {
    const normalizedName = this.normalizeAgentName(agentName);

    if (this.agents.has(normalizedName)) {
      const agent = this.agents.get(normalizedName)!;
      await agent.initialize();
      return agent;
    }

    const config = await getAgentConfig(normalizedName);
    const options = BaseAgent.optionsFromRegistry(config, this.clientName);

    const agent = this.createAgent(normalizedName, options);
    await agent.initialize();
    this.agents.set(normalizedName, agent);

    return agent;
  }

  private normalizeAgentName(name: string): string {
    const nameMap: Record<string, string> = {
      normal: 'normal',
      pleased: 'pleased',
      cheerful: 'cheerful',
      ecstatic: 'ecstatic',
      melancholy: 'melancholy',
      sorrowful: 'sorrowful',
      depressed: 'depressed',
      irritated: 'irritated',
      agitated: 'agitated',
      enraged: 'enraged',
      sentiment: 'sentiment',
    };
    return nameMap[name.toLowerCase()] ?? name.toLowerCase();
  }

  private createAgent(agentName: string, options: import('./base-agent.js').BaseAgentOptions): AgentInstance {
    switch (agentName) {
      case 'sentiment':
        return new SentimentAgent(options);
      case 'normal':
        return new NormalAgent(options);
      case 'pleased':
        return new HappyLevel1PleasedAgent(options);
      case 'cheerful':
        return new HappyLevel2CheerfulAgent(options);
      case 'ecstatic':
        return new HappyLevel3EcstaticAgent(options);
      case 'melancholy':
        return new SadLevel1MelancholyAgent(options);
      case 'sorrowful':
        return new SadLevel2SorrowfulAgent(options);
      case 'depressed':
        return new SadLevel3DepressedAgent(options);
      case 'irritated':
        return new AngryLevel1IrritatedAgent(options);
      case 'agitated':
        return new AngryLevel2AgitatedAgent(options);
      case 'enraged':
        return new AngryLevel3EnragedAgent(options);
      default:
        throw new Error(`Agent "${agentName}" not in registry. Factory only creates agents from registry.`);
    }
  }

  /**
   * Get sentiment agent (convenience method)
   */
  async getSentimentAgent(): Promise<SentimentAgent> {
    return (await this.getAgent('sentiment')) as SentimentAgent;
  }

  /**
   * Clear agent cache (useful for testing or reloading)
   */
  clearCache(): void {
    this.agents.clear();
  }

  /**
   * Get all available agent names
   */
  getAvailableAgents(): AgentType[] {
    return [
      'normal',
      'pleased',
      'cheerful',
      'ecstatic',
      'melancholy',
      'sorrowful',
      'depressed',
      'irritated',
      'agitated',
      'enraged',
    ];
  }
}

