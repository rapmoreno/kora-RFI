/**
 * Prompt Loader Utility
 * Loads markdown prompts from client-specific directories
 */

import { readFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PromptLoadError } from './errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache for loaded prompts
const promptCache = new Map<string, string>();

/**
 * Get the project root directory
 * Works in both local development and Vercel serverless environments
 * On Vercel, root-level dirs (agents/, prompts/) are only accessible inside public/
 */
async function getProjectRoot(): Promise<string> {
  const fromCompiled = join(__dirname, '..', '..', '..');
  const root = __dirname.includes('dist') ? fromCompiled : process.cwd();

  // Check if prompts exist at root level (local dev)
  const promptsAtRoot = join(root, 'prompts');
  const promptsInPublic = join(root, 'public', 'prompts');

  try {
    await access(promptsAtRoot);
    return root;
  } catch {
    try {
      await access(promptsInPublic);
      return join(root, 'public');
    } catch {
      return root;
    }
  }
}

/**
 * Load a prompt file
 * @param promptFile - Full path (e.g. "prompts/synapse/emotional-state-engine-prompts/normal_agent.md") or filename for legacy
 * @param clientName - Client name (defaults to "synapse" or CLIENT_NAME env var) - used when promptFile is filename only
 * @returns Promise<string> - The prompt content
 */
export async function loadPrompt(
  promptFile: string,
  clientName?: string
): Promise<string> {
  const client = clientName || process.env.CLIENT_NAME || 'synapse';
  const cacheKey = `${client}:${promptFile}`;

  if (promptCache.has(cacheKey)) {
    return promptCache.get(cacheKey)!;
  }

  try {
    const projectRoot = await getProjectRoot();

    // Registry format: full path (prompts/...)
    const possiblePaths = promptFile.startsWith('prompts/')
      ? [join(projectRoot, promptFile)]
      : [
          join(projectRoot, 'prompts', client, 'emotional-state-engine-prompts', promptFile),
          join(process.cwd(), 'prompts', client, 'emotional-state-engine-prompts', promptFile),
          join(process.cwd(), 'public', 'prompts', client, 'emotional-state-engine-prompts', promptFile),
          join(__dirname, '..', '..', '..', 'prompts', client, 'emotional-state-engine-prompts', promptFile),
        ];
    
    let content: string | null = null;
    let successfulPath: string | null = null;
    
    // Try each path until one works
    for (const promptPath of possiblePaths) {
      try {
        console.log(`📄 Trying to load prompt: ${promptFile} (client: ${client})`);
        console.log(`   Attempting path: ${promptPath}`);
        
        content = await readFile(promptPath, 'utf-8');
        successfulPath = promptPath;
        break;
      } catch (pathError) {
        // Try next path
        continue;
      }
    }
    
    if (!content) {
      throw new Error(`Prompt file not found in any of the attempted paths: ${possiblePaths.join(', ')}`);
    }
    
    const trimmedContent = content.trim();
    console.log(`✅ Loaded prompt: ${promptFile} (${trimmedContent.length} chars) from ${successfulPath}`);

    // Cache it
    promptCache.set(cacheKey, trimmedContent);

    return trimmedContent;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    const projectRoot = await getProjectRoot();
    const attemptedPath = join(
      projectRoot,
      'prompts',
      client,
      'emotional-state-engine-prompts',
      promptFile
    );
    console.error(`❌ Failed to load prompt file: ${promptFile}`);
    console.error(`   Client: ${client}`);
    console.error(`   Attempted path: ${attemptedPath}`);
    console.error(`   Project root: ${projectRoot}`);
    console.error(`   Error: ${err.message} (code: ${err.code})`);
    
    if (err.code === 'ENOENT') {
      throw new PromptLoadError(promptFile, client, err);
    }
    throw new PromptLoadError(promptFile, client, err);
  }
}

/**
 * Clear the prompt cache (useful for testing or reloading)
 */
export function clearPromptCache(): void {
  promptCache.clear();
}

/**
 * Preload multiple prompts
 */
export async function preloadPrompts(
  promptFiles: string[],
  clientName?: string
): Promise<void> {
  await Promise.all(
    promptFiles.map((file) => loadPrompt(file, clientName))
  );
}

