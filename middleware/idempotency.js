'use strict';

/**
 * NirnayPath — Idempotency Key Enforcement Middleware (Phase 11 — Module C)
 * =========================================================================
 * Prevents duplicate submissions for critical mutative endpoints (POST/PUT/PATCH).
 * E.g., duplicate payments, dual test completions, double badge unlocking.
 *
 * Flow:
 *  1. Client sends 'Idempotency-Key' header (e.g., UUID).
 *  2. If missing, we can optionally enforce it or pass-through depending on route.
 *     We enforce it for critical routes (e.g. /api/payment, /api/test/submit).
 *  3. If key exists and is 'IN_PROGRESS', returns 409 Conflict.
 *  4. If key exists and is 'COMPLETED', returns the cached status, headers, and body immediately.
 *  5. If key is new, set state as 'IN_PROGRESS' with a 5-minute TTL.
 *  6. Proceed to route handler. Intercept res.send/res.json to save response and set status to 'COMPLETED'.
 *
 * Storage:
 *  - Primary: Redis (via redisService)
 *  - Fallback: Local memory Map (for high availability)
 */

const { isRedisAvailable, getRedisClient } = require('../services/redisService');
const logger = require('../utils/logger');

const IDEMPOTENCY_PREFIX = 'idemp:';
const LOCK_TTL_S = 300; // 5 minutes TTL

// High-availability L1 fallback
const _localIdempotency = new Map();

// Periodic cleanup of expired local idempotency cache entries (every 60s)
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of _localIdempotency.entries()) {
        if (now > record.expiresAt) {
            _localIdempotency.delete(key);
        }
    }
}, 60000).unref();

/**
 * Idempotency Middleware Generator
 * @param {Object} options
 * @param {boolean} options.enforce - If true, throws 400 if Idempotency-Key header is missing.
 */
function idempotency(options = {}) {
    const { enforce = true } = options;

    return async function idempotencyMiddleware(req, res, next) {
        // Only enforce on mutative requests
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            return next();
        }

        const key = req.headers['idempotency-key'];

        if (!key) {
            if (enforce) {
                return res.status(400).json({
                    error: 'Idempotency-Key header is required for this mutative action.'
                });
            }
            return next();
        }

        const storageKey = `${IDEMPOTENCY_PREFIX}${req.path}:${key}`;

        try {
            // Check if key is already processed or processing
            const record = await getIdempotencyRecord(storageKey);

            if (record) {
                if (record.status === 'IN_PROGRESS') {
                    logger.warn(`[IDEMPOTENCY] Duplicate request in-progress. Key="${key}" Path="${req.path}"`);
                    return res.status(409).json({
                        error: 'A duplicate request is already in progress. Please wait and retry.'
                    });
                }

                if (record.status === 'COMPLETED') {
                    logger.info(`[IDEMPOTENCY] Cache hit. Serving cached response. Key="${key}" Path="${req.path}"`);
                    res.status(record.statusCode);
                    // Restore cached headers if any
                    if (record.headers) {
                        for (const [hName, hVal] of Object.entries(record.headers)) {
                            res.setHeader(hName, hVal);
                        }
                    }
                    res.setHeader('X-Cache-Lookup', 'IDEMPOTENT');
                    return res.send(record.body);
                }
            }

            // Lock the key as IN_PROGRESS
            await setIdempotencyRecord(storageKey, { status: 'IN_PROGRESS' }, LOCK_TTL_S);

        } catch (err) {
            logger.error(`[IDEMPOTENCY] Pre-flight check failed: ${err.message}. Proceeding without safety.`);
            return next();
        }

        // Intercept response methods to capture body and update state to COMPLETED
        const originalSend = res.send.bind(res);
        
        res.send = async function (body) {
            try {
                // Determine if we should cache the response (typically 2xx and 4xx, avoid caching 5xx transient server errors)
                if (res.statusCode < 500) {
                    const payload = {
                        status: 'COMPLETED',
                        statusCode: res.statusCode,
                        body: typeof body === 'object' ? JSON.stringify(body) : body,
                        headers: {
                            'content-type': res.getHeader('content-type')
                        }
                    };
                    await setIdempotencyRecord(storageKey, payload, LOCK_TTL_S);
                } else {
                    // Release the lock if a server error occurred so they can retry
                    await deleteIdempotencyRecord(storageKey);
                }
            } catch (err) {
                logger.error(`[IDEMPOTENCY] Post-flight response capture failed: ${err.message}`);
            }

            return originalSend(body);
        };

        next();
    };
}

// ── Storage Helpers ───────────────────────────────────────────────────

async function getIdempotencyRecord(storageKey) {
    if (isRedisAvailable()) {
        try {
            const raw = await getRedisClient().get(storageKey);
            if (raw) return JSON.parse(raw);
        } catch (err) {
            logger.warn(`[IDEMPOTENCY] Redis read failure: ${err.message}. Using L1 fallback.`);
        }
    }

    // Local L1 fallback
    const local = _localIdempotency.get(storageKey);
    if (local) {
        if (Date.now() > local.expiresAt) {
            _localIdempotency.delete(storageKey);
            return null;
        }
        return local.data;
    }
    return null;
}

async function setIdempotencyRecord(storageKey, data, ttlSecs) {
    if (isRedisAvailable()) {
        try {
            await getRedisClient().set(
                storageKey,
                JSON.stringify(data),
                'EX',
                ttlSecs
            );
            // Also store in L1 fallback for ultra-resilience
        } catch (err) {
            logger.warn(`[IDEMPOTENCY] Redis write failure: ${err.message}. Using L1 fallback.`);
        }
    }

    // Local L1 fallback
    _localIdempotency.set(storageKey, {
        data,
        expiresAt: Date.now() + ttlSecs * 1000
    });
}

async function deleteIdempotencyRecord(storageKey) {
    if (isRedisAvailable()) {
        try {
            await getRedisClient().del(storageKey);
        } catch (_) {}
    }
    _localIdempotency.delete(storageKey);
}

module.exports = idempotency;
