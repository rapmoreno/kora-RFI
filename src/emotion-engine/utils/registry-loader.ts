/**
 * Registry Loader
 * Loads and validates agents/registry.yaml. No fallback - fails if missing or invalid.
 */

import { readFile } from 'fs/promises';
import { access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface AgentRegistryEntry {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  provider: 'groq' | 'openrouter';
  model: string;
  description: string;
  tags: string[];
  prompt_file: string;
  output_schema: string;
  params: {
    temperature: number;
    max_tokens: number;
    hardware_provider?: string;
  };
  guardrails: unknown[];
  skip_personality?: boolean;
}

export interface AgentRegistry {
  version: number;
  agents: AgentRegistryEntry[];
}

let registryCache: AgentRegistry | null = null;

async function getProjectRoot(): Promise<string> {
  const fromCompiled = join(__dirname, '..', '..', '..');
  const root = __dirname.includes('dist') ? fromCompiled : process.cwd();

  // On Vercel, root-level dirs (agents/, prompts/) are only accessible inside public/
  const registryAtRoot = join(root, 'agents', 'registry.yaml');
  const registryInPublic = join(root, 'public', 'agents', 'registry.yaml');

  try {
    await access(registryAtRoot);
    return root;
  } catch {
    try {
      await access(registryInPublic);
      return join(root, 'public');
    } catch {
      // Fall through to root — the caller will report the detailed error
      return root;
    }
  }
}

/**
 * Load registry from agents/registry.yaml. Throws if missing or invalid.
 */
export async function loadRegistry(): Promise<AgentRegistry> {
  if (registryCache) {
    return registryCache;
  }

  const projectRoot = await getProjectRoot();
  const registryPath = join(projectRoot, 'agents', 'registry.yaml');

  let raw: string;
  try {
    raw = await readFile(registryPath, 'utf-8');
  } catch (err) {
    const nodeErr = err as NodeJS.ErrnoException;
    throw new Error(
      `Agent registry not found at ${registryPath}. ${nodeErr.code === 'ENOENT' ? 'File does not exist.' : nodeErr.message}`
    );
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(raw);
  } catch (err) {
    const yamlErr = err as Error;
    throw new Error(`Agent registry invalid YAML: ${yamlErr.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || !('agents' in parsed)) {
    throw new Error('Agent registry must have an "agents" array');
  }

  const registry = parsed as AgentRegistry;
  if (!Array.isArray(registry.agents)) {
    throw new Error('Agent registry "agents" must be an array');
  }

  for (const agent of registry.agents) {
    if (!agent?.id || typeof agent.id !== 'string') {
      throw new Error(`Agent registry entry missing required "id" (string)`);
    }
    if (!agent?.prompt_file || typeof agent.prompt_file !== 'string') {
      throw new Error(`Agent "${agent.id}" missing required "prompt_file"`);
    }
    if (!agent?.provider || !['groq', 'openrouter'].includes(agent.provider)) {
      throw new Error(`Agent "${agent.id}" must have provider "groq" or "openrouter"`);
    }
    if (!agent?.model || typeof agent.model !== 'string') {
      throw new Error(`Agent "${agent.id}" missing required "model"`);
    }
    if (!agent?.params || typeof agent.params !== 'object') {
      throw new Error(`Agent "${agent.id}" missing required "params"`);
    }
  }

  registryCache = registry;
  return registry;
}

/**
 * Get agent config by id. Throws if agent not in registry.
 */
export async function getAgentConfig(agentId: string): Promise<AgentRegistryEntry> {
  const registry = await loadRegistry();
  const normalizedId = agentId.toLowerCase();
  const agent = registry.agents.find((a) => a.id.toLowerCase() === normalizedId);

  if (!agent) {
    const available = registry.agents.map((a) => a.id).join(', ');
    throw new Error(
      `Agent "${agentId}" not found in registry. Available: ${available}`
    );
  }

  if (!agent.enabled) {
    throw new Error(`Agent "${agentId}" is disabled in registry`);
  }

  return agent;
}

/**
 * Clear cache (for testing or reload)
 */
export function clearRegistryCache(): void {
  registryCache = null;
}
