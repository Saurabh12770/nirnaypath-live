'use strict';

require('dotenv').config();

/**
 * Centralized Feature Flags
 *
 * Supports dynamic hot-reloading via environment variables without restarting
 * the PM2 cluster. Each flag defaults to OFF unless explicitly enabled.
 * Only flags wired to active live code paths are listed here.
 */

const FeatureFlags = {
    // V2 Telemetry Engine
    ENABLE_V2_TELEMETRY: process.env.ENABLE_V2_TELEMETRY === 'true',
    ENABLE_TELEMETRY_DUAL_WRITE: process.env.ENABLE_TELEMETRY_DUAL_WRITE !== 'false', // Default true
    ENABLE_HEARTBEAT_COMPRESSION: process.env.ENABLE_HEARTBEAT_COMPRESSION === 'true',
    ENABLE_REDIS_STREAMS: process.env.ENABLE_REDIS_STREAMS === 'true',

    // AI Intelligence & Analytics
    ENABLE_AI_ANALYTICS: process.env.ENABLE_AI_ANALYTICS === 'true',
    ENABLE_FRAUD_ENGINE: process.env.ENABLE_FRAUD_ENGINE === 'true',

    // Core Examination Engine
    ENABLE_IRT_ENGINE: process.env.ENABLE_IRT_ENGINE === 'true',

    // National Audit Ledger (appendRecord wired in NationalAuditLedger.js)
    ENABLE_NATIONAL_AUDIT_LEDGER: process.env.ENABLE_NATIONAL_AUDIT_LEDGER === 'true',

    /**
     * Helper to gracefully check flag status.
     * @param {string} flagName
     * @returns {boolean}
     */
    isEnabled: (flagName) => {
        return !!FeatureFlags[flagName];
    }
};

module.exports = FeatureFlags;

