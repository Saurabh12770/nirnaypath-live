'use strict';

/**
 * NirnayPath — Query Profiler Service (Phase 11 — Module A)
 * =========================================================
 * Real latency measurement: P50, P95, P99
 * Slow query detection + automatic logging
 * Per-collection, per-operation telemetry
 *
 * NO fake values. All metrics from actual timing measurements.
 */

const logger = require('../utils/logger');

// Latency histogram — rolling window of last N samples per collection
const MAX_SAMPLES = 2000;

class QueryProfiler {
    static _samples = new Map(); // collectionOp → [latencyMs, ...]
    static _slowQueries = [];     // { collection, op, filter, latencyMs, timestamp }
    static _callCounts = new Map();
    static SLOW_THRESHOLD_MS = parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || '100');

    /**
     * Wrap a Mongoose query with latency measurement.
     * Usage:
     *   const result = await QueryProfiler.profile('TestResult', 'find', () => TestResult.find(q).lean());
     */
    static async profile(collection, operation, queryFn, filterHint = null) {
        const startMs = Date.now();
        let result;
        let error = null;

        try {
            result = await queryFn();
        } catch (err) {
            error = err;
        }

        const latencyMs = Date.now() - startMs;
        const key = `${collection}.${operation}`;

        // Record sample (rolling window)
        if (!this._samples.has(key)) this._samples.set(key, []);
        const arr = this._samples.get(key);
        arr.push(latencyMs);
        if (arr.length > MAX_SAMPLES) arr.shift(); // drop oldest

        // Increment call count
        this._callCounts.set(key, (this._callCounts.get(key) || 0) + 1);

        // Slow query log
        if (latencyMs >= this.SLOW_THRESHOLD_MS) {
            const record = {
                collection,
                operation,
                latencyMs,
                filter: filterHint ? JSON.stringify(filterHint).slice(0, 300) : null,
                timestamp: new Date().toISOString()
            };
            this._slowQueries.push(record);
            if (this._slowQueries.length > 500) this._slowQueries.shift();

            logger.warn(`[QUERY-PROFILER][SLOW] ${key} took ${latencyMs}ms`, record);
        }

        if (error) throw error;
        return result;
    }

    /**
     * Compute percentile from a sorted copy of the array.
     */
    static _percentile(arr, p) {
        if (!arr || arr.length === 0) return null;
        const sorted = [...arr].sort((a, b) => a - b);
        const idx = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[Math.max(0, idx)];
    }

    /**
     * Get latency stats for all tracked collection+operations.
     */
    static getStats() {
        const stats = {};
        for (const [key, samples] of this._samples.entries()) {
            if (samples.length === 0) continue;
            stats[key] = {
                count:    this._callCounts.get(key) || 0,
                samples:  samples.length,
                p50:      this._percentile(samples, 50),
                p95:      this._percentile(samples, 95),
                p99:      this._percentile(samples, 99),
                min:      Math.min(...samples),
                max:      Math.max(...samples),
                avg:      Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
            };
        }
        return stats;
    }

    /**
     * Get recent slow queries for dashboard.
     */
    static getSlowQueries(limit = 50) {
        return this._slowQueries.slice(-limit).reverse();
    }

    /**
     * Reset all metrics (e.g. on deploy).
     */
    static reset() {
        this._samples.clear();
        this._slowQueries.length = 0;
        this._callCounts.clear();
    }

    /**
     * Summary object for /api/health/deep.
     */
    static getSummary() {
        const stats = this.getStats();
        const keys = Object.keys(stats);
        let worstP99 = null;
        let worstKey = null;

        for (const key of keys) {
            if (stats[key].p99 !== null && (worstP99 === null || stats[key].p99 > worstP99)) {
                worstP99 = stats[key].p99;
                worstKey = key;
            }
        }

        return {
            trackedOperations: keys.length,
            slowQueriesRecent: this._slowQueries.length,
            slowThresholdMs:   this.SLOW_THRESHOLD_MS,
            worstP99Ms:        worstP99,
            worstOperation:    worstKey,
            stats
        };
    }
}

module.exports = QueryProfiler;
