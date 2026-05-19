/**
 * Event Loop Safeguard & Thread Shield (Phase 9 — SRE Production Hardened)
 * ========================================================================
 * High-performance event-loop monitoring utility that detects thread lag
 * and provides non-blocking cooperative yielding (setImmediate execution) 
 * for heavy CPU bound tasks (e.g. database aggregations, exam generation).
 */

'use strict';

const logger = require('./logger');

let currentLag = 0;

// Continuous background lag detector (non-blocking)
setInterval(() => {
    const start = Date.now();
    setImmediate(() => {
        currentLag = Date.now() - start;
        if (currentLag > 100) {
            logger.warn(`[EVENT_LOOP_WARN] Event loop lag detected: ${currentLag}ms. High CPU pressure.`);
        }
    });
}, 1000).unref();

/**
 * Retrieve the current recorded event loop lag in milliseconds
 * @returns {number} Lag in ms
 */
const getEventLoopLag = () => currentLag;

/**
 * Cooperative Multi-tasking Yield
 * Yields control back to the Node.js event loop if the current lag exceeds 
 * the threshold. This allows other concurrent HTTP requests, socket events,
 * and database driver responses to run.
 * 
 * @param {number} thresholdMs Lag threshold to trigger yielding (default: 50ms)
 * @returns {Promise<void>} Resolves immediately, or on next event loop tick
 */
const yieldIfLagging = async (thresholdMs = 50) => {
    if (currentLag > thresholdMs) {
        logger.info(`[EVENT_LOOP_SHIELD] Yielding execution thread. Lag is ${currentLag}ms (threshold: ${thresholdMs}ms)`);
        await new Promise(resolve => setImmediate(resolve));
    }
};

/**
 * Process a large array in asynchronous chunks to avoid blocking the event loop
 * 
 * @param {Array} array Input array to process
 * @param {Function} processor Async/sync function to execute on each item
 * @param {number} chunkSize Number of items per chunk (default: 100)
 * @returns {Promise<Array>} Accumulated results
 */
const processInChunks = async (array, processor, chunkSize = 100) => {
    const results = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        // Yield to let the event loop process other network/IO ticks
        await yieldIfLagging(30);

        const chunk = array.slice(i, i + chunkSize);
        const chunkPromises = chunk.map((item, index) => processor(item, i + index));
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
    }
    return results;
};

module.exports = {
    getEventLoopLag,
    yieldIfLagging,
    processInChunks
};
