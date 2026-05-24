'use strict';

/**
 * workers/architectureWorker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE DRIFT BACKGROUND WORKER
 *
 * CONTRACT:
 *   - Exports a single run(server) function.
 *   - NEVER executed at require/import time (no top-level side effects).
 *   - NEVER references global.eventEmitter or any app.js lifecycle object.
 *   - ArchitectureLockService is dynamically required INSIDE run() only.
 *   - Safe to load in any environment; dormant until run() is explicitly called.
 *
 * CALLED BY: bootstrap/workersLoader.js — never by app.js directly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * run()
 * Entry point called by the bootstrap loader after the server is fully bound.
 * Uses setImmediate to push execution past the current I/O phase.
 *
 * @param {import('http').Server} _server - HTTP server instance (available for future use)
 */
function run(_server) {
  // Push into next I/O idle slot — guarantees no CPU pressure on request handlers
  setImmediate(() => {
    _executeValidation();
  });
}

function _executeValidation() {
  try {
    console.log('[WORKER][Architecture] Starting background architecture drift verification...');

    // Dynamic require — ArchitectureLockService is NEVER part of the boot module graph
    const ArchitectureLockService = require('../services/ArchitectureLockService');
    ArchitectureLockService.runStartupValidation();

    console.log('[WORKER][Architecture] Architecture drift validation dispatched successfully.');
  } catch (err) {
    console.error('[WORKER][Architecture] Drift validation failed:', err.message);
  }
}

module.exports = { run };
