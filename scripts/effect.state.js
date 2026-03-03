"use strict";

/**
 * Module: effect.state.js
 * Type: Effect module
 * Purpose: Single application state. Only file allowed to hold state.
 *
 * Depends on: nothing
 * Used by: Web Components, effect modules
 * Side effects: Dispatches app:state-changed custom event on updates
 */

const INITIAL_STATE = Object.freeze({
  conversationId: null,
  conversationHistory: [],
  emotionState: null,
  lastAgentType: null,
  isLoading: false,
});

let state = INITIAL_STATE;

export const getState = () => state;

export const getInitialState = () => ({ ...INITIAL_STATE });

export const updateState = (reducerFn) => {
  state = Object.freeze(reducerFn(state));
  document.dispatchEvent(new CustomEvent('app:state-changed', {
    detail: state,
    bubbles: true
  }));
};
