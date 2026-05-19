'use strict';

/**
 * routes/health.js (Phase 9 — SRE Observability Hardened)
 * =======================================================
 * Enterprise-grade observability and health diagnostics
 * for the NirnayPath production platform.
 *
 * Endpoints:
 *   GET /api/health/email   — Email queue diagnostics (existing)
 *   GET /api/health/deep    — Full SRE-grade system deep health check
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getMetrics } = require('../services/emailMetrics');
const { emailQueue, digestQueue } = require('../services/queueService');
const { isRedisAvailable, getRedisClient } = require('../services/redisService');
const socketService = require('../services/socketService');
const cacheLayer = require('../services/cacheLayer');

/**
 * Helper to measure Node.js event-loop lag
 * @returns {Promise<number>} Lag in milliseconds
 */
const measureEventLoopLag = () => {
    return new Promise((resolve) => {
        const start = Date.now();
        setImmediate(() => {
            resolve(Date.now() - start);
        });
    });
};

/**
 * GET /api/health/email
 * Comprehensive observability for the email subsystem
 */
router.get('/email', async (req, res) => {
    if (!emailQueue) {
        return res.json({ status: 'degraded', reason: 'Email queue unavailable' });
    }

    try {
        const [metrics, waiting, active, failed, completed, waitingJobs] = await Promise.all([
            getMetrics(),
            emailQueue.getWaitingCount().catch(() => 0),
            emailQueue.getActiveCount().catch(() => 0),
            emailQueue.getFailedCount().catch(() => 0),
            emailQueue.getCompletedCount().catch(() => 0),
            emailQueue.getWaiting(0, 0).catch(() => [])
        ]);

        let oldestJobLagMs = 0;
        if (waitingJobs.length > 0) {
            oldestJobLagMs = Date.now() - waitingJobs[0].timestamp;
        }

        const dlqCount = parseInt(metrics.dlq?.count || 0);
        const hasDlqAlert = dlqCount > 0;
        const isStuck = waiting > 20 || oldestJobLagMs > 120000;
        const highFailureRate = completed > 10 && failed > (completed * 0.3);

        let status = 'healthy';
        if (isStuck || highFailureRate) status = 'degraded';
        if (hasDlqAlert && status === 'healthy') status = 'degraded';

        res.json({
            status,
            timestamp: new Date().toISOString(),
            alerts: { dlqPresent: hasDlqAlert, workerStall: oldestJobLagMs > 60000, highFailureRate },
            queue: { waiting, active, failed, completed, oldestJobLagMs },
            metrics
        });
    } catch (err) {
        res.status(500).json({ status: 'unhealthy', error: err.message });
    }
});

/**
 * GET /api/health/deep
 * ====================
 * SRE-grade deep health-check and scoring.
 * Evaluates event-loop lag, Mongo latency, Redis latency, memory pressure,
 * queues, websockets, cache diagnostics, and PM2 cluster states.
 */
router.get('/deep', async (req, res) => {
    const startTime = Date.now();
    const results = {};
    let healthScore = 100;
    
    // ── 1. Event Loop Lag ───────────────────────────────────────────────────
    let eventLoopLagMs = 0;
    try {
        eventLoopLagMs = await measureEventLoopLag();
        results.eventLoop = {
            status: eventLoopLagMs > 200 ? 'critical' : eventLoopLagMs > 50 ? 'warning' : 'healthy',
            lagMs: eventLoopLagMs
        };
        if (eventLoopLagMs > 200) healthScore -= 20;
        else if (eventLoopLagMs > 50) healthScore -= 5;
    } catch (e) {
        results.eventLoop = { status: 'error', error: e.message };
        healthScore -= 10;
    }

    // ── 2. MongoDB Latency ──────────────────────────────────────────────────
    try {
        const mongoState = mongoose.connection.readyState;
        const mongoStateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
        
        let pingMs = null;
        let mongoStatus = 'unhealthy';

        if (mongoState === 1) {
            const pingStart = Date.now();
            await mongoose.connection.db.admin().ping();
            pingMs = Date.now() - pingStart;
            mongoStatus = pingMs > 500 ? 'degraded' : 'healthy';
        }

        if (mongoStatus === 'healthy') {
            // Check if ping latency is exceptionally high
            if (pingMs > 200) {
                mongoStatus = 'degraded';
                healthScore -= 5;
            }
        } else if (mongoStatus === 'degraded') {
            healthScore -= 15;
        } else {
            healthScore -= 30;
        }

        results.mongodb = {
            status: mongoStatus,
            state: mongoStateMap[mongoState] || 'unknown',
            pingMs,
            host: mongoose.connection.host || 'unknown'
        };
    } catch (e) {
        healthScore -= 30;
        results.mongodb = { status: 'error', error: e.message };
    }

    // ── 3. Redis Latency ────────────────────────────────────────────────────
    try {
        const enabled = process.env.ENABLE_REDIS !== 'false' && !!process.env.REDIS_URL;
        let redisStatus = 'disabled';
        let pingMs = null;

        if (enabled) {
            const available = isRedisAvailable();
            if (available) {
                const client = getRedisClient();
                const pingStart = Date.now();
                await client.ping();
                pingMs = Date.now() - pingStart;
                redisStatus = pingMs > 100 ? 'degraded' : 'healthy';
                
                if (pingMs > 100) healthScore -= 5;
            } else {
                redisStatus = 'unhealthy';
                healthScore -= 25;
            }
        }

        results.redis = {
            status: redisStatus,
            enabled,
            pingMs,
            connected: isRedisAvailable()
        };
    } catch (e) {
        healthScore -= 25;
        results.redis = { status: 'error', error: e.message };
    }

    // ── 4. Memory Pressure ──────────────────────────────────────────────────
    try {
        const mem = process.memoryUsage();
        const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
        const rssMB = Math.round(mem.rss / 1024 / 1024);
        const heapPct = Math.round((mem.heapUsed / mem.heapTotal) * 100);

        const memStatus = heapPct > 90 ? 'critical'
                        : heapPct > 75 ? 'degraded'
                        : 'healthy';
        
        if (memStatus === 'critical') healthScore -= 20;
        else if (memStatus === 'degraded') healthScore -= 8;

        results.memory = {
            status: memStatus,
            heapUsedMB,
            heapTotalMB,
            rssMB,
            heapUsedPct: `${heapPct}%`
        };
    } catch (e) {
        results.memory = { status: 'error', error: e.message };
    }

    // ── 5. Queues Backlog ───────────────────────────────────────────────────
    try {
        const queueStats = {
            emailQueueInitialized: !!emailQueue,
            digestQueueInitialized: !!digestQueue
        };

        let emailWaiting = 0;
        let emailActive = 0;
        let digestWaiting = 0;
        let digestActive = 0;

        if (emailQueue) {
            emailWaiting = await emailQueue.getWaitingCount().catch(() => 0);
            emailActive = await emailQueue.getActiveCount().catch(() => 0);
        }
        if (digestQueue) {
            digestWaiting = await digestQueue.getWaitingCount().catch(() => 0);
            digestActive = await digestQueue.getActiveCount().catch(() => 0);
        }

        const backlog = emailWaiting + digestWaiting;
        const queueStatus = backlog > 500 ? 'critical' : backlog > 100 ? 'degraded' : 'healthy';

        if (queueStatus === 'critical') healthScore -= 15;
        else if (queueStatus === 'degraded') healthScore -= 5;

        results.queues = {
            status: queueStatus,
            backlog,
            emailQueue: { waiting: emailWaiting, active: emailActive },
            digestQueue: { waiting: digestWaiting, active: digestActive },
            ...queueStats
        };
    } catch (e) {
        results.queues = { status: 'error', error: e.message };
    }

    // ── 6. Websocket Server ─────────────────────────────────────────────────
    try {
        const socketStats = {
            initialized: !!socketService.io,
            connectionsCount: socketService.io ? socketService.io.sockets.sockets.size : 0,
            hasRedisAdapter: !!socketService.pubClient
        };

        let socketStatus = 'healthy';
        if (socketStats.initialized && socketStats.hasRedisAdapter) {
            const adapterConnected = socketService.pubClient.status === 'ready';
            socketStats.adapterConnected = adapterConnected;
            if (!adapterConnected) {
                socketStatus = 'degraded';
                healthScore -= 10;
            }
        }

        results.websockets = {
            status: socketStatus,
            ...socketStats
        };
    } catch (e) {
        results.websockets = { status: 'error', error: e.message };
    }

    // ── 7. Cache Metrics ────────────────────────────────────────────────────
    try {
        results.cache = typeof cacheLayer.getDiagnostics === 'function'
            ? cacheLayer.getDiagnostics()
            : { status: 'healthy', note: 'Local in-memory active' };
    } catch (e) {
        results.cache = { status: 'degraded', error: e.message };
    }

    // ── 8. Active Test Sessions ─────────────────────────────────────────────
    try {
        const TestSession = require('../models/testSession');
        const activeCount = await TestSession.countDocuments({ status: 'active' }).catch(() => 0);
        results.activeSessions = { status: 'healthy', count: activeCount };
    } catch (e) {
        results.activeSessions = { status: 'error', error: e.message };
    }

    // ── 9. PM2 Worker State ─────────────────────────────────────────────────
    results.pm2 = {
        isPM2: process.env.pm_id !== undefined,
        workerId: process.env.pm_id !== undefined ? parseInt(process.env.pm_id) : null,
        instanceId: process.env.NODE_APP_INSTANCE !== undefined ? parseInt(process.env.NODE_APP_INSTANCE) : null,
        totalInstances: process.env.instances !== undefined ? process.env.instances : null
    };

    // ── 10. Process Details ─────────────────────────────────────────────────
    results.process = {
        status: 'healthy',
        uptimeSeconds: Math.floor(process.uptime()),
        pid: process.pid,
        nodeVersion: process.version,
        env: process.env.NODE_ENV || 'development',
        platform: process.platform
    };

    // ── Status Scoring Gradients ────────────────────────────────────────────
    let overallStatus = 'healthy';
    if (healthScore < 70) {
        overallStatus = 'unhealthy';
    } else if (healthScore < 90) {
        overallStatus = 'degraded';
    }

    // Ensure score doesn't dip below 0
    healthScore = Math.max(0, healthScore);

    const responseTimeMs = Date.now() - startTime;

    res.status(overallStatus === 'unhealthy' ? 503 : 200).json({
        status: overallStatus,
        healthScore,
        timestamp: new Date().toISOString(),
        responseTimeMs,
        version: process.env.npm_package_version || '1.0.0',
        subsystems: results
    });
});

module.exports = router;
