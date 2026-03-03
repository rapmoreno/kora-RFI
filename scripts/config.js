"use strict";

/**
 * Module: config.js
 * Type: Config
 * Purpose: All constants, API URLs, feature flags, timeouts
 *
 * Depends on: nothing
 * Used by: effect modules, main.js
 * Side effects: None
 */

export const CONFIG = Object.freeze({
  APP_NAME: 'Project Name',
  API_BASE: import.meta.env.VITE_API_BASE || '',
  DEV_MODE: import.meta.env.DEV
});
