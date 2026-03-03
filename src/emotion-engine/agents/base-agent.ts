/**
 * Base Agent Class
 * Base class for all emotional agents with Groq/OpenRouter LLM integration.
 * Config from agents/registry.yaml only. No fallback.
 */

import type { ChatMessage } from '../types.js';
import { loadPrompt } from '../utils/prompt-loader.js';
import { GroqAdapter } from '../adapters/groq-adapter.js';
import { OpenRouterAdapter } from '../adapters/openrouter-adapter.js';
import type { AgentRegistryEntry } from '../utils/registry-loader.js';

export interface BaseAgentOptions {
  promptFile: string;
  model: string;
  provider: 'groq' | 'openrouter';
  temperature: number;
  maxTokens: number;
  /** OpenRouter provider preference when hardware_provider in registry params */
  hardwareProvider?: string;
  skipPersonality?: boolean;
  clientName?: string;
  agentId: string;
}

export abstract class BaseAgent {
  protected systemPrompt: string;
  protected agentType: string;
  protected model: string;
  protected temperature: number;
  protected maxTokens: number;
  protected agentId: string;
  protected groqAdapter!: GroqAdapter;
  protected openRouterAdapter?: OpenRouterAdapter;
  protected clientName: string;
  private initialized: boolean = false;
  private useOpenRouter: boolean = false;

  constructor(options: BaseAgentOptions) {
    this.clientName = options.clientName || process.env.CLIENT_NAME || 'synapse';
    this.systemPrompt = '';
    this.agentType = this.constructor.name.toLowerCase().replace('agent', '');
    this.agentId = options.agentId;
    this.model = options.model;
    this.temperature = options.temperature;
    this.maxTokens = options.maxTokens;
    (this as any)._hardwareProvider = options.hardwareProvider;
    this.useOpenRouter = options.provider === 'openrouter';

    if (this.useOpenRouter) {
      this.openRouterAdapter = new OpenRouterAdapter({ model: this.model });
    } else {
      this.groqAdapter = new GroqAdapter({ model: this.model });
    }

    (this as any)._promptFile = options.promptFile;
    (this as any)._skipPersonality = options.skipPersonality || false;
  }

  /** Create BaseAgentOptions from registry entry */
  static optionsFromRegistry(entry: AgentRegistryEntry, clientName?: string): BaseAgentOptions {
    return {
      promptFile: entry.prompt_file,
      model: entry.model,
      provider: entry.provider,
      temperature: entry.params.temperature,
      maxTokens: entry.params.max_tokens,
      hardwareProvider: entry.params.hardware_provider,
      skipPersonality: entry.skip_personality,
      clientName: clientName || process.env.CLIENT_NAME || 'synapse',
      agentId: entry.id,
    };
  }

  /**
   * Initialize prompts (async) - must be called before use
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const promptFile = (this as any)._promptFile;
      const skipPersonality = (this as any)._skipPersonality;

      // Load core personality and agent-specific prompt
      const personalityPrompt = skipPersonality ? '' : await loadPrompt('sassi_personality.md', this.clientName);
      const agentPrompt = await loadPrompt(promptFile, this.clientName);

      // Load linguistic engine and false memory prompts
      const linguisticEnginePrompt = await loadPrompt('linguistic-engine.md', this.clientName);
      const falseMemoryPrompt = await loadPrompt('false-memory.md', this.clientName);

      // Combine prompts: personality + linguistic engine + false memory + agent-specific
      const promptParts: string[] = [];
      
      if (!skipPersonality && personalityPrompt) {
        promptParts.push(personalityPrompt);
      }
      
      if (linguisticEnginePrompt) {
        promptParts.push(linguisticEnginePrompt);
      }
      
      if (falseMemoryPrompt) {
        promptParts.push(falseMemoryPrompt);
      }
      
      if (agentPrompt) {
        promptParts.push(agentPrompt);
      }

      // Filter out empty prompts and join
      const nonEmptyParts = promptParts.filter((part) => part.trim());
      this.systemPrompt = nonEmptyParts.join('\n\n---\n\n');
      this.initialized = true;
    } catch (error) {
      const err = error as Error;
      console.error(`❌ Failed to load prompts for ${this.agentType}:`, err.message);
      console.error(`   Client: ${this.clientName}, Prompt file: ${(this as any)._promptFile}`);
      throw err;
    }
  }

  /**
   * Ensure prompts are loaded (call before using)
   */
  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Generate response based on conversation history
   */
  abstract generateResponse(messages: ChatMessage[]): Promise<string>;

  /**
   * Trim conversation history to maintain context window
   */
  protected trimConversationHistory(messages: ChatMessage[], maxMessages: number = 20): ChatMessage[] {
    if (messages.length <= maxMessages) {
      return messages;
    }

    // Keep the most recent messages for better context
    return messages.slice(-maxMessages);
  }

  /**
   * Call LLM API (Groq or OpenRouter) - common LLM call logic
   * Uses registry params by default; overrides supported for special cases (e.g. sentiment)
   */
  protected async callGroq(
    messages: ChatMessage[],
    maxTokensOverride?: number,
    temperatureOverride?: number
  ): Promise<string> {
    await this.ensureInitialized();

    const maxTokens = maxTokensOverride ?? this.maxTokens;
    const temperature = temperatureOverride ?? this.temperature;

    const trimmedMessages = this.trimConversationHistory(messages);

    const apiMessages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt },
      ...trimmedMessages,
    ];

    const hardwareProvider = (this as any)._hardwareProvider;
    const providerOpt = hardwareProvider
      ? { order: [hardwareProvider.toLowerCase()] as string[] }
      : undefined;

    if (this.useOpenRouter && this.openRouterAdapter) {
      return await this.openRouterAdapter.call(apiMessages, {
        model: this.model,
        maxTokens,
        temperature,
        provider: providerOpt,
      });
    } else {
      return await this.groqAdapter.call(apiMessages, {
        model: this.model,
        maxTokens,
        temperature,
      });
    }
  }

  /**
   * Get agent type
   */
  getAgentType(): string {
    return this.agentType;
  }

  /**
   * Get model being used
   */
  getModel(): string {
    return this.model;
  }
}

