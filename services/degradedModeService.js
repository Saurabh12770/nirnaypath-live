'use strict';

/**
 * NirnayPath — Graceful System Degradation & Circuit Breaker Engine (Phase 11 — Module F)
 * ====================================================================================
 * Coordinates fallback states when core infrastructure (MongoDB, Redis, Email API, Razorpay)
 * experiences high latency, heavy load, or total downtime.
 *
 * Implements:
 *   - Auto-degradation flags (active/passive triggers)
 *   - Circuit breakers for external APIs
 *   - Graceful local fallbacks (read-only states, in-memory question banks)
 */

const logger = require('../utils/logger');
const mongoose = require('mongoose');
const { isRedisAvailable } = require('./redisService');

// State flags
const _degradedStates = {
    mongodb:  false,
    redis:    false,
    external: false // Razorpay/SMTP
};

// Automatic recovery timers
const _timers = new Map();

class DegradedModeService {

    /**
     * Mark a subsystem as degraded.
     *
     * @param {string} subsystem - 'mongodb', 'redis', 'external'
     * @param {number} [autoRecoveryMs=30000] - Duration before trying auto-recovery
     */
    static triggerDegradedMode(subsystem, autoRecoveryMs = 30000) {
        if (!_degradedStates.hasOwnProperty(subsystem)) return;

        if (!_degradedStates[subsystem]) {
            _degradedStates[subsystem] = true;
            logger.error(`[DEGRADED-MODE] Subsystem "${subsystem}" marked as DEGRADED. Initiating graceful fallbacks.`);
        }

        // Setup auto-recovery timer
        if (_timers.has(subsystem)) {
            clearTimeout(_timers.get(subsystem));
        }

        const timer = setTimeout(() => {
            this.clearDegradedMode(subsystem);
        }, autoRecoveryMs);

        // Keep process running if it's the only task
        timer.unref();
        _timers.set(subsystem, timer);
    }

    /**
     * Reset degraded state for a subsystem.
     */
    static clearDegradedMode(subsystem) {
        if (_degradedStates[subsystem]) {
            _degradedStates[subsystem] = false;
            logger.info(`[DEGRADED-MODE] Subsystem "${subsystem}" recovered. Normal operations restored.`);
        }
        if (_timers.has(subsystem)) {
            clearTimeout(_timers.get(subsystem));
            _timers.delete(subsystem);
        }
    }

    /**
     * Get active degraded status.
     */
    static getStatus() {
        // Active check: is Mongoose connected?
        const isMongoDown = mongoose.connection.readyState !== 1;
        // Active check: is Redis connected?
        const isRedisDown = !isRedisAvailable();

        return {
            mongodb:  _degradedStates.mongodb || isMongoDown,
            redis:    _degradedStates.redis || isRedisDown,
            external: _degradedStates.external,
            isSystemDegraded: _degradedStates.mongodb || isMongoDown || _degradedStates.redis || isRedisDown || _degradedStates.external
        };
    }

    /**
     * Resilient execution wrap. If primary fails, log, degrade, and run fallback.
     */
    static async executeWithFallback(subsystem, primaryFn, fallbackFn) {
        const status = this.getStatus();

        if (status[subsystem]) {
            // Already degraded — jump straight to fallback
            logger.warn(`[DEGRADED-MODE][BYPASS] Subsystem "${subsystem}" is degraded. Routing to fallback.`);
            return await fallbackFn();
        }

        try {
            return await primaryFn();
        } catch (err) {
            logger.error(`[DEGRADED-MODE][FAILURE] Subsystem "${subsystem}" crashed: ${err.message}. Triggering fallback.`);
            
            // Mark as degraded
            this.triggerDegradedMode(subsystem);

            // Execute fallback
            return await fallbackFn(err);
        }
    }
}

module.exports = DegradedModeService;
