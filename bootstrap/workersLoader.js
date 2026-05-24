'use strict';

/**
 * bootstrap/workersLoader.js
 * ─────────────────────────────────────────────────────────────────────────────
 * ISOLATED WORKER BOOTSTRAP SUBSYSTEM
 *
 * CONTRACT:
 *   - This file is NEVER imported at boot time.
 *   - It is ONLY called from inside server.listen() via process.nextTick().
 *   - It dynamically requires every worker inside a function body.
 *   - The main app.js has ZERO knowledge of which workers exist.
 *   - Workers never import from this file.
 *
 * EXECUTION GUARANTEE:
 *   process.nextTick ensures this runs AFTER the current I/O phase completes
 *   (i.e., AFTER the TCP port is fully bound and accepting connections).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

const WORKER_REGISTRY = [
  // Each entry: { id, path, description }
  {
    id: 'architecture-drift',
    path: '../workers/architectureWorker',
    description: 'Architecture drift validator',
  },
  // Add additional background workers here without touching app.js
];

/**
 * start()
 * Called once, after server is confirmed listening.
 * @param {import('http').Server} server - The live HTTP server instance
 */
function start(server) {
  process.nextTick(() => {
    _launchWorkers(server);
  });
}

function _launchWorkers(server) {
  console.log('[BOOTSTRAP] Workers loader activated. Port is bound. Launching background subsystems...');

  for (const entry of WORKER_REGISTRY) {
    try {
      // Dynamic require inside function body — zero boot-time module side-effect
      const worker = require(entry.path);

      if (typeof worker.run === 'function') {
        // Stagger each worker into its own setImmediate slot to avoid
        // stacking synchronous work on the first tick.
        setImmediate(() => {
          try {
            console.log(`[BOOTSTRAP] Starting worker: ${entry.id} — ${entry.description}`);
            worker.run(server);
          } catch (err) {
            console.error(`[BOOTSTRAP][ERROR] Worker "${entry.id}" threw on run():`, err.message);
          }
        });
      } else {
        console.warn(`[BOOTSTRAP][WARN] Worker "${entry.id}" has no exported run() function. Skipping.`);
      }
    } catch (err) {
      console.error(`[BOOTSTRAP][ERROR] Failed to load worker "${entry.id}":`, err.message);
    }
  }
}

module.exports = { start };
