"use strict";

/**
 * Module: effect.api.js
 * Type: Effect module
 * Purpose: Fetch wrappers for emotion engine API (chat, config, reset)
 *
 * Depends on:
 *   - effect.error.js (withErrorHandling, addBreadcrumb)
 *
 * Used by: ChatManager, app-chat-input (future)
 *
 * Side effects: HTTP requests, network I/O
 */

import { withErrorHandling, addBreadcrumb } from "./effect.error.js";

const API_BASE = "";

/**
 * POST /api/emotional-state/chat
 * @param {{ message: string, conversationId?: string, history?: Array<{role:string,content:string}>, emotionState?: object }} payload
 * @returns {Promise<{ response: string, agent_type: string, avatar_emoji: string, emotion_state?: object }>}
 */
export const sendChat = withErrorHandling(
  async ({ message, conversationId, history, emotionState }) => {
    addBreadcrumb("effect.api", "sendChat");
    const res = await fetch(`${API_BASE}/api/emotional-state/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        history: history || [],
        emotion_state: emotionState || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `API error: ${res.status}`);
    }
    return res.json();
  },
  { module: "effect.api", function: "sendChat" }
);

/**
 * GET /api/config
 * @returns {Promise<{ avatarUrl: string, voiceId: string }>}
 */
export const getConfig = withErrorHandling(
  async () => {
    addBreadcrumb("effect.api", "getConfig");
    const res = await fetch(`${API_BASE}/api/config`);
    if (!res.ok) throw new Error(`Config error: ${res.status}`);
    return res.json();
  },
  { module: "effect.api", function: "getConfig" }
);

/**
 * POST /api/emotional-state/reset
 * @returns {Promise<{ message: string }>}
 */
export const resetState = withErrorHandling(
  async () => {
    addBreadcrumb("effect.api", "resetState");
    const res = await fetch(`${API_BASE}/api/emotional-state/reset`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(`Reset error: ${res.status}`);
    return res.json();
  },
  { module: "effect.api", function: "resetState" }
);
