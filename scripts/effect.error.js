"use strict";

/**
 * Module: effect.error.js
 * Type: Effect module
 * Purpose: Centralized error handling. All errors go through this module.
 *
 * Depends on:
 *   - effect.state.js (state snapshot on error)
 *
 * Used by: all effect modules, all Web Components
 * Side effects: Console output, DOM error overlay in dev mode
 */

const breadcrumbs = [];
const MAX_BREADCRUMBS = 10;

export const addBreadcrumb = (module, action) => {
  breadcrumbs.push({
    timestamp: new Date().toISOString(),
    module,
    action
  });
  if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift();
};

export const handleError = (error, context = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    severity: context.severity || 'ERROR',
    module: context.module || 'unknown',
    function: context.function || 'unknown',
    error: error.message || String(error),
    input: context.input || null,
    state: null,
    stack: error.stack || '',
    breadcrumbs: [...breadcrumbs]
  };

  console.error(`[${entry.severity}] ${entry.module}.${entry.function}:`, entry);

  if (entry.severity === 'FATAL') {
    renderErrorOverlay(entry);
  }
};

export const withErrorHandling = (fn, context) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    handleError(error, { ...context, input: args });
  }
};

const renderErrorOverlay = (entry) => {
  if (!import.meta.env.DEV) return;
  const overlay = document.createElement('div');
  overlay.id = 'error-overlay';
  overlay.setAttribute('role', 'alert');
  overlay.innerHTML = `
    <pre style="position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.9);color:#ff6b6b;padding:2rem;overflow:auto;font-size:14px;font-family:monospace;white-space:pre-wrap;">${JSON.stringify(entry, null, 2)}</pre>
  `;
  document.body.appendChild(overlay);
};
