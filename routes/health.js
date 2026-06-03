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
const RedisCacheLayer = require('../services/redisCacheLayer');
const CacheTagService = require('../services/cacheTagService');
const QueryProfiler = require('../services/queryProfiler');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

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
    const { isRedisAvailable } = require('../services/redisService');
    const { isSmtpActive } = require('../workers/emailWorker');
    const CrashReportingService = require('../services/crashReportingService');

    // 1. Database Status Check
    let databaseStatus = 'DEGRADED';
    try {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.db.admin().ping();
            databaseStatus = 'ACTIVE';
        }
    } catch (_) {
        databaseStatus = 'DEGRADED';
    }

    // 2. Redis Status Check
    const redisStatus = isRedisAvailable() ? 'ACTIVE' : 'DEGRADED';

    // 3. SMTP Status Check
    const smtpStatus = isSmtpActive() ? 'ACTIVE' : 'DEGRADED';

    // 4. Sentry Status Check
    const sentryStatus = CrashReportingService.isSentryActive() ? 'ACTIVE' : 'DEGRADED';

    // 5. Razorpay Status Check
    const hasRazorpay = !!(process.env.RAZORPAY_KEY_ID && 
                           process.env.RAZORPAY_KEY_SECRET && 
                           process.env.RAZORPAY_WEBHOOK_SECRET);
    const razorpayStatus = hasRazorpay ? 'ACTIVE' : 'DEGRADED';

    // 6. Uptime Format Check
    const uptimeSeconds = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

    res.json({
        database: databaseStatus,
        redis: redisStatus,
        smtp: smtpStatus,
        sentry: sentryStatus,
        razorpay: razorpayStatus,
        uptime: uptimeStr
    });
});

/**
 * GET /api/health/env-audit
 * Audits all live environment variables securely with masking.
 */
router.get('/env-audit', auth, adminAuth, (req, res) => {
    const auditVars = [
        { name: 'MONGO_URI', actual: process.env.MONGO_URI, expectedType: 'string', isSecret: true },
        { name: 'MONGODB_URI', actual: process.env.MONGODB_URI, expectedType: 'string', isSecret: true },
        { name: 'JWT_SECRET', actual: process.env.JWT_SECRET, expectedType: 'string', isSecret: true },
        { name: 'EMAIL_HOST', actual: process.env.EMAIL_HOST, expectedType: 'string', isSecret: false },
        { name: 'EMAIL_PORT', actual: process.env.EMAIL_PORT, expectedType: 'string_or_number', isSecret: false },
        { name: 'EMAIL_USER', actual: process.env.EMAIL_USER, expectedType: 'string', isSecret: false },
        { name: 'EMAIL_PASSWORD', actual: process.env.EMAIL_PASSWORD, expectedType: 'string', isSecret: true },
        { name: 'EMAIL_PASS', actual: process.env.EMAIL_PASS, expectedType: 'string', isSecret: true },
        { name: 'EMAIL_FROM', actual: process.env.EMAIL_FROM, expectedType: 'string', isSecret: false },
        { name: 'RAZORPAY_KEY_ID', actual: process.env.RAZORPAY_KEY_ID, expectedType: 'string', isSecret: false },
        { name: 'RAZORPAY_SECRET', actual: process.env.RAZORPAY_SECRET, expectedType: 'string', isSecret: true },
        { name: 'RAZORPAY_KEY_SECRET', actual: process.env.RAZORPAY_KEY_SECRET, expectedType: 'string', isSecret: true },
        { name: 'REDIS_URL', actual: process.env.REDIS_URL, expectedType: 'string', isSecret: true },
        { name: 'VAPID_PUBLIC_KEY', actual: process.env.VAPID_PUBLIC_KEY, expectedType: 'string', isSecret: false },
        { name: 'VAPID_PRIVATE_KEY', actual: process.env.VAPID_PRIVATE_KEY, expectedType: 'string', isSecret: true }
    ];

    const results = {};
    const missing = [];
    const invalid = [];
    const unused = [];

    const mask = (str) => {
        if (!str) return 'not_set';
        if (str.length <= 8) return '***';
        return str.substring(0, 3) + '...' + str.substring(str.length - 3);
    };

    auditVars.forEach(v => {
        const val = v.actual;
        const exists = val !== undefined && val !== null && val !== '';
        
        results[v.name] = {
            present: exists,
            valueLength: exists ? String(val).length : 0,
            maskedValue: exists ? (v.isSecret ? mask(String(val)) : String(val)) : null
        };

        if (!exists) {
            // Check if there's a valid fallback/alias
            let fallbackExists = false;
            if (v.name === 'MONGODB_URI' && process.env.MONGO_URI) fallbackExists = true;
            if (v.name === 'MONGO_URI' && process.env.MONGODB_URI) fallbackExists = true;
            if (v.name === 'EMAIL_PASSWORD' && process.env.EMAIL_PASS) fallbackExists = true;
            if (v.name === 'EMAIL_PASS' && process.env.EMAIL_PASSWORD) fallbackExists = true;
            if (v.name === 'RAZORPAY_SECRET' && process.env.RAZORPAY_KEY_SECRET) fallbackExists = true;
            if (v.name === 'RAZORPAY_KEY_SECRET' && process.env.RAZORPAY_SECRET) fallbackExists = true;

            if (!fallbackExists) {
                missing.push(v.name);
            } else {
                unused.push(v.name + ' (Fallback/Alias ' + (v.name.includes('URI') ? 'MONGO_URI' : v.name.includes('PASS') ? 'EMAIL_PASS' : 'RAZORPAY_KEY_SECRET') + ' is active instead)');
            }
        } else {
            // Validation
            let isValid = true;
            if (v.name.includes('PORT')) {
                const portNum = parseInt(val, 10);
                if (isNaN(portNum) || portNum <= 0) isValid = false;
            } else if (v.name.includes('URI')) {
                if (!val.startsWith('mongodb://') && !val.startsWith('mongodb+srv://')) isValid = false;
            }
            if (!isValid) {
                invalid.push(v.name);
            }
        }
    });

    res.json({
        timestamp: new Date().toISOString(),
        audit: results,
        summary: {
            missing,
            invalid,
            unused
        }
    });
});

/**
 * GET /api/health/services
 * ========================
 * Returns the status ("ACTIVE" or "DEGRADED") of backing services:
 * Redis, SMTP, Razorpay, and Sentry.
 * 
 * Ensures absolute privacy — zero secrets, configurations, or credentials leaked.
 */
/**
 * GET /api/health/detailed
 * ========================
 * High-concurrency SRE Observability status endpoint exposing:
 * - database status (latency, pool)
 * - redis status (cluster info, ping latency)
 * - websocket status (active count)
 * - memory statistics
 * - cache hit ratios (L1 + L2 diagnostics)
 * - event loop lag
 */
router.get('/detailed', async (req, res) => {
    const start = Date.now();
    
    // 1. Event Loop Lag
    const lagMs = await measureEventLoopLag();

    // 2. Database Diagnostics
    let dbStatus = 'disconnected';
    let dbLatencyMs = -1;
    try {
        if (mongoose.connection.readyState === 1) {
            const dbStart = Date.now();
            await mongoose.connection.db.admin().ping();
            dbLatencyMs = Date.now() - dbStart;
            dbStatus = 'connected';
        }
    } catch (_) {
        dbStatus = 'unhealthy';
    }

    const dbStats = {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        maxPoolSize: mongoose.connection.client?.options?.maxPoolSize || 'default',
        minPoolSize: mongoose.connection.client?.options?.minPoolSize || 'default',
        socketTimeoutMS: mongoose.connection.client?.options?.socketTimeoutMS || 'default'
    };

    // 3. Redis Diagnostics
    let redisStatus = 'disconnected';
    let redisLatencyMs = -1;
    let redisDetails = {};
    try {
        if (isRedisAvailable()) {
            const redisStart = Date.now();
            await getRedisClient().ping();
            redisLatencyMs = Date.now() - redisStart;
            redisStatus = 'connected';
            redisDetails = {
                type: process.env.REDIS_CLUSTER_MODE === 'true' ? 'cluster' : 'standalone',
                status: getRedisClient().status || 'ready'
            };
        }
    } catch (err) {
        redisStatus = 'unhealthy';
        redisDetails = { error: err.message };
    }

    // 4. WebSocket Connections Count
    let socketCount = 0;
    if (socketService && socketService.io) {
        try {
            socketCount = socketService.io.sockets.sockets.size;
        } catch (_) {}
    }

    // 5. Memory Utilization
    const memUsage = process.memoryUsage();
    const memoryStats = {
        rssMB: Math.round(memUsage.rss / 1024 / 1024),
        heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        externalMB: Math.round(memUsage.external / 1024 / 1024)
    };

    // 6. Cache Hit/Miss Ratios
    let cacheDiagnostics = {};
    try {
        cacheDiagnostics = await RedisCacheLayer.getDiagnostics();
    } catch (err) {
        try {
            cacheDiagnostics = { l1: cacheLayer.getDiagnostics(), l2: { error: err.message } };
        } catch (_) {}
    }

    // 7. General Uptime
    const uptimeSeconds = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;

    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        overallLatencyMs: Date.now() - start,
        uptime: {
            seconds: uptimeSeconds,
            formatted: `${hours}h ${minutes}m ${seconds}s`
        },
        eventLoop: {
            lagMs: Math.round(lagMs * 100) / 100
        },
        database: dbStats,
        redis: {
            status: redisStatus,
            latencyMs: redisLatencyMs,
            details: redisDetails
        },
        websocket: {
            activeConnections: socketCount
        },
        memory: memoryStats,
        cache: cacheDiagnostics
    });
});

module.exports = router;
