"use strict";

/**
 * Module: effect.tts.js
 * Type: Effect module
 * Purpose: TTS API fetch, audio decoding and volume boost
 *
 * Depends on: effect.error.js, pure.tts.js
 *
 * Used by: TTSManager
 *
 * Side effects: HTTP, Web Audio API
 */

import { withErrorHandling, addBreadcrumb } from "./effect.error.js";
import { cleanTextForTTS } from "./pure.tts.js";

export { cleanTextForTTS };

/**
 * Call ElevenLabs TTS API
 * @param {{ text: string, voiceId: string, modelId?: string, speed?: number }} opts
 * @returns {Promise<{ success: boolean, audio?: string, lipSync?: object, duration?: number }>}
 */
export const fetchTTS = withErrorHandling(
  async (opts) => {
    addBreadcrumb("effect.tts", "fetchTTS");
    const cleanText = cleanTextForTTS(opts.text);
    if (!cleanText) throw new Error("No valid text after cleaning");

    const res = await fetch("/api/elevenlabs/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: cleanText,
        voiceId: opts.voiceId,
        modelId: opts.modelId || "eleven_multilingual_v2",
        speed: opts.speed ?? 0.8,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `TTS API error: ${res.status}`);
    }

    return res.json();
  },
  { module: "effect.tts", function: "fetchTTS" }
);
