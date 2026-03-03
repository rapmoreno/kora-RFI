"use strict";

/**
 * Module: main.js
 * Type: Entry point
 * Purpose: Application initialization
 *
 * Depends on:
 *   - config.js (application config)
 *
 * Used by: index.html
 * Side effects: Initializes application
 */

import { CONFIG } from './config.js';

// Import web components here so custom elements are registered before use
// import '../web-components/site-nav.js';

const init = () => {
  if (CONFIG.DEV_MODE) {
    console.log(`[${CONFIG.APP_NAME}] Running in dev mode`);
  }
};

document.addEventListener('DOMContentLoaded', init);
