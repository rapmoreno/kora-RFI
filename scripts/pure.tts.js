"use strict";

/**
 * Module: pure.tts.js
 * Type: Pure module
 * Purpose: Text preprocessing for TTS (emoji/tag removal)
 *
 * Depends on: nothing
 *
 * Used by: effect.tts.js, TTSManager
 *
 * Side effects: None
 */

/**
 * Remove thinking tags and emojis from text for TTS
 * @param {string} text
 * @returns {string}
 */
export function cleanTextForTTS(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/<t>[\s\S]*?<\/t>/gi, "")
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "")
    .replace(/[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, "")
    .replace(/[\u{2000}-\u{206F}]/gu, "")
    .replace(/[\u{2190}-\u{21FF}]/gu, "")
    .replace(/[\u{2B50}\u{2B55}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
