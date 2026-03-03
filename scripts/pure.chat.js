"use strict";

/**
 * Module: pure.chat.js
 * Type: Pure module
 * Purpose: Reducers and pure logic for chat state
 *
 * Depends on: nothing
 *
 * Used by: effect.state.js, effect modules
 *
 * Side effects: None
 */

/**
 * Create new conversation ID
 * @returns {string}
 */
export const createConversationId = () =>
  `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Reducer: add user message and set loading
 * @param {object} state
 * @param {{ message: string }} action
 * @returns {object}
 */
export const reducers = Object.freeze({
  chatSend: (state, { message }) => ({
    ...state,
    conversationHistory: [
      ...(state.conversationHistory || []),
      { role: "user", content: message },
    ],
    isLoading: true,
  }),

  chatResponse: (state, { response, emotionState, agentType }) => ({
    ...state,
    conversationHistory: [
      ...(state.conversationHistory || []),
      { role: "assistant", content: response },
    ],
    emotionState: emotionState || state.emotionState,
    lastAgentType: agentType,
    isLoading: false,
  }),

  chatError: (state) => ({
    ...state,
    isLoading: false,
  }),

  chatReset: (state) => ({
    ...state,
    conversationId: createConversationId(),
    conversationHistory: [],
    emotionState: null,
  }),
});
