'use strict';

/**
 * ProductionTelemetryEngine — Phase 19C
 * =======================================
 * REAL system metrics. No Math.random(). No mocks.
 * Replaces fake telemetry in OperationsTelemetryService.getMongoLag()
 * and SelfHealingInfrastructureEngine.checkRedisPressure().
 *
 * Provides:
 *  - Real Redis memory usage + command latency
 *  - Real MongoDB ping latency + connection state
 *  - Real Node.js event loop lag (setImmediate delta)
 *  - Real heap usage per process
 *  - Structured JSON log output
 */

const { getRedisClient, isRedisAvailable } = require('./redisService');
const mongoose = require('mongoose');
const os = require('os');
const logger = require('../utils/logger');

class ProductionTelemetryEngine {

    // ── Redis Metrics ────────────────────────────────────────────────────────

    /**
     * Real Redis memory usage via INFO memory command.
     * @returns {Object} { usedMemoryMb, maxMemoryMb, usedMemoryPct, fragmentationRatio }
     */
    static async getRedisMemoryMetrics() {
        if (!isRedisAvailable()) return { status: 'unavailable' };
        const client = getRedisClient();
        try {
            const info = await client.info('memory');
            const parse = (key) => {
                const match = info.match(new RegExp(`${key}:(\\d+)`));
                return match ? parseInt(match[1], 10) : 0;
            };
            const usedMemoryBytes = parse('used_memory');
            const maxMemoryBytes = parse('maxmemory');
            const fragmentationRatio = parseFloat((info.match(/mem_fragmentation_ratio:([0-9.]+)/) || [])[1] || '0');

            return {
                status: 'ok',
                usedMemoryMb: +(usedMemoryBytes / 1024 / 1024).toFixed(2),
                maxMemoryMb: maxMemoryBytes > 0 ? +(maxMemoryBytes / 1024 / 1024).toFixed(2) : null,
                usedMemoryPct: maxMemoryBytes > 0
                    ? +((usedMemoryBytes / maxMemoryBytes) * 100).toFixed(1)
                    : null,
                fragmentationRatio,
            };
        } catch (err) {
            logger.error('[TELEMETRY] Redis memory info failed:', { error: err.message });
            return { status: 'error', error: err.message };
        }
    }

    /**
     * Real Redis command latency using LATENCY LATEST.
     * Falls back to PING round-trip if LATENCY not supported.
     */
    static async getRedisCommandLatency() {
        if (!isRedisAvailable()) return { status: 'unavailable' };
        const client = getRedisClient();
        try {
            const pingStart = process.hrtime.bigint();
            await client.ping();
            const pingNs = Number(process.hrtime.bigint() - pingStart);
            const pingMs = +(pingNs / 1e6).toFixed(3);

            let latencyHistory = [];
            try {
                // LATENCY LATEST returns event-name, last-measured-latency, max-ever-seen
                const raw = await client.call('LATENCY', 'LATEST');
                if (Array.isArray(raw)) {
                    latencyHistory = raw.map(entry => ({
                        event: entry[0],
                        latestMs: entry[1],
                        maxMs: entry[2],
                    }));
                }
            } catch (_) {
                // LATENCY command not enabled — ping RTT is sufficient
            }

            return { status: 'ok', pingRttMs: pingMs, latencyHistory };
        } catch (err) {
            return { status: 'error', error: err.message };
        }
    }

    /**
     * Redis connection pool status via INFO clients.
     */
    static async getRedisConnectionPoolMetrics() {
        if (!isRedisAvailable()) return { status: 'unavailable' };
        const client = getRedisClient();
        try {
            const info = await client.info('clients');
            const parse = (key) => {
                const match = info.match(new RegExp(`${key}:(\\d+)`));
                return match ? parseInt(match[1], 10) : 0;
            };
            return {
                status: 'ok',
                connectedClients: parse('connected_clients'),
                blockedClients: parse('blocked_clients'),
                trackingClients: parse('tracking_clients'),
                clientsInTimeout: parse('clients_in_timeout_table'),
            };
        } catch (err) {
            return { status: 'error', error: err.message };
        }
    }

    // ── MongoDB Metrics ──────────────────────────────────────────────────────

    /**
     * Real MongoDB ping latency via admin().ping().
     * REPLACES the Math.random() mock in OperationsTelemetryService.
     */
    static async getMongoLatencyMetrics() {
        const state = mongoose.connection.readyState;
        const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
        if (state !== 1) {
            return { status: 'unhealthy', state: stateMap[state] || 'unknown', pingMs: null };
        }
        try {
            const start = process.hrtime.bigint();
            await mongoose.connection.db.admin().ping();
            const ns = Number(process.hrtime.bigint() - start);
            const pingMs = +(ns / 1e6).toFixed(3);
            return {
                status: pingMs > 500 ? 'degraded' : pingMs > 200 ? 'warning' : 'healthy',
                state: 'connected',
                pingMs,
                host: mongoose.connection.host || 'unknown',
                dbName: mongoose.connection.name || 'unknown',
            };
        } catch (err) {
            return { status: 'error', error: err.message };
        }
    }

    /**
     * MongoDB connection pool status.
     */
    static async getMongoConnectionMetrics() {
        if (mongoose.connection.readyState !== 1) return { status: 'disconnected' };
        try {
            const serverStatus = await mongoose.connection.db.admin().serverStatus();
            const connections = serverStatus.connections || {};
            return {
                status: 'ok',
                current: connections.current || 0,
                available: connections.available || 0,
                totalCreated: connections.totalCreated || 0,
            };
        } catch (err) {
            // serverStatus may be restricted on Atlas free tier
            return {
                status: 'limited',
                note: 'serverStatus restricted. Using poolSize from options.',
                configuredPoolSize: mongoose.connection.base?.options?.maxPoolSize || 'unknown',
            };
        }
    }

    // ── Node.js Metrics ──────────────────────────────────────────────────────

    /**
     * Real event loop lag using high-resolution setImmediate delta.
     */
    static measureEventLoopLag() {
        return new Promise((resolve) => {
            const start = process.hrtime.bigint();
            setImmediate(() => {
                const ns = Number(process.hrtime.bigint() - start);
                resolve(+(ns / 1e6).toFixed(3));
            });
        });
    }

    /**
     * Real heap usage per process.
     */
    static getHeapMetrics() {
        const mem = process.memoryUsage();
        return {
            rssBytes: mem.rss,
            heapTotalBytes: mem.heapTotal,
            heapUsedBytes: mem.heapUsed,
            externalBytes: mem.external,
            arrayBuffers: mem.arrayBuffers,
            heapUsedMb: +(mem.heapUsed / 1024 / 1024).toFixed(2),
            heapTotalMb: +(mem.heapTotal / 1024 / 1024).toFixed(2),
            rssMb: +(mem.rss / 1024 / 1024).toFixed(2),
            heapUsedPct: +((mem.heapUsed / mem.heapTotal) * 100).toFixed(1),
        };
    }

    /**
     * OS-level CPU and load metrics.
     */
    static getSystemMetrics() {
        return {
            pid: process.pid,
            uptime: process.uptime(),
            nodeVersion: process.version,
            platform: process.platform,
            cpuCount: os.cpus().length,
            loadAvg1m: os.loadavg()[0],
            loadAvg5m: os.loadavg()[1],
            totalMemMb: +(os.totalmem() / 1024 / 1024).toFixed(2),
            freeMemMb: +(os.freemem() / 1024 / 1024).toFixed(2),
        };
    }

    // ── Aggregate Snapshot ───────────────────────────────────────────────────

    /**
     * Full production telemetry snapshot. All real metrics.
     * Outputs structured JSON log and returns the snapshot.
     */
    static async collectSnapshot() {
        const [
            redisMemory,
            redisLatency,
            redisPool,
            mongoLatency,
            mongoConnections,
            eventLoopLagMs,
        ] = await Promise.all([
            this.getRedisMemoryMetrics(),
            this.getRedisCommandLatency(),
            this.getRedisConnectionPoolMetrics(),
            this.getMongoLatencyMetrics(),
            this.getMongoConnectionMetrics(),
            this.measureEventLoopLag(),
        ]);

        const snapshot = {
            timestamp: new Date().toISOString(),
            process: this.getSystemMetrics(),
            heap: this.getHeapMetrics(),
            eventLoopLagMs,
            redis: {
                memory: redisMemory,
                latency: redisLatency,
                pool: redisPool,
            },
            mongodb: {
                latency: mongoLatency,
                connections: mongoConnections,
            },
        };

        // Structured log output for log aggregation (Datadog, Loki, Railway logs)
        logger.info('[TELEMETRY][SNAPSHOT]', snapshot);

        return snapshot;
    }
}

module.exports = ProductionTelemetryEngine;
