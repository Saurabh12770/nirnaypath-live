'use strict';

/**
 * NirnayPath — Disaster Recovery Retry Service (Phase 11 — Module F)
 * =================================================================
 * Provides resilient execution of transient operations (e.g., third-party API calls,
 * Razorpay requests, external push notifications, flaky MongoDB operations).
 *
 * Implements:
 *   - Exponential Backoff (initial delay * factor^attempt)
 *   - Randomized Jitter (prevents synchronization/thundering herd)
 *   - Maximum Delay Cap
 *   - Fail-Fast check for non-retryable errors (e.g., 401 Unauthorized, 400 Bad Request)
 */

const logger = require('../utils/logger');

class RetryService {

    /**
     * Execute an operation with exponential backoff and jitter.
     *
     * @param {Function} operationFn - async fn() representing the operation
     * @param {Object}   [options]
     * @param {number}     [options.maxRetries=3]       Max retry attempts
     * @param {number}     [options.initialDelayMs=200] Starting delay
     * @param {number}     [options.maxDelayMs=10000]   Maximum backoff cap
     * @param {number}     [options.factor=2]           Exponential multiplication factor
     * @param {boolean}    [options.jitter=true]        Apply randomized noise
     * @param {Function}   [options.isRetryable=null]   Custom filter fn(err) => bool
     * @returns {Promise<*>} Result of operationFn
     */
    static async retry(operationFn, options = {}) {
        const {
            maxRetries     = 3,
            initialDelayMs = 200,
            maxDelayMs     = 10000,
            factor         = 2,
            jitter         = true,
            isRetryable    = null
        } = options;

        let attempt = 0;

        while (true) {
            try {
                return await operationFn();
            } catch (err) {
                attempt++;

                // If max retries reached, or custom logic says this error is NOT retryable
                const retryable = isRetryable ? isRetryable(err) : this._defaultIsRetryable(err);

                if (attempt > maxRetries || !retryable) {
                    logger.error(`[RETRY-SERVICE] Operation failed permanently after ${attempt} attempts: ${err.message}`);
                    throw err;
                }

                // Calculate exponential backoff delay
                let delay = initialDelayMs * Math.pow(factor, attempt - 1);
                delay = Math.min(delay, maxDelayMs);

                // Apply randomized jitter (+/- 25% of delay)
                if (jitter) {
                    const noise = (Math.random() * 0.5 - 0.25) * delay;
                    delay = Math.max(0, Math.round(delay + noise));
                }

                logger.warn(`[RETRY-SERVICE] Attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * Default error filter to determine if an error is transient/retryable.
     */
    static _defaultIsRetryable(err) {
        if (!err) return false;

        // HTTP status codes
        if (err.statusCode) {
            // 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found are NOT transient
            if (err.statusCode >= 400 && err.statusCode < 500) {
                return false;
            }
        }

        const msg = String(err.message || '').toLowerCase();

        // Database transient errors
        if (msg.includes('connection') || 
            msg.includes('timeout') || 
            msg.includes('socket') || 
            msg.includes('econnrefused') || 
            msg.includes('etimedout') ||
            msg.includes('network') ||
            msg.includes('write conflict') || // MongoDB transient transaction error
            msg.includes('busy')) {
            return true;
        }

        return true; // Assume retryable by default for other unclassified exceptions
    }
}

module.exports = RetryService;
