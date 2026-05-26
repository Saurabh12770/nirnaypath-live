'use strict';

/**
 * routes/telemetry.js
 * Phase 9A: Telemetry ingestion and admin overview endpoints.
 * Integrates client-side report ingestion and server-side request tracing.
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const OperationsTelemetryService = require('../services/OperationsTelemetryService');
const RuntimeTelemetryService = require('../services/runtimeTelemetryService');
const TelemetryIngestService = require('../services/TelemetryIngestService');
const logger = require('../utils/logger');
const os = require('os');
const {
    store,
    recordError,
    recordLongTask,
    recordActiveUser,
    recordSessionDuration,
    snapshotMemory,
    reset
} = require('../utils/telemetryStore');

// ---------------------------------------------------------------------------
// Client-side heartbeat ingestion  (POST /api/telemetry/heartbeat)
// ---------------------------------------------------------------------------
router.post('/heartbeat', async (req, res) => {
    try {
        await TelemetryIngestService.ingest(req.body);
        res.json({ ok: true });
    } catch (err) {
        logger.error(`[Telemetry] Heartbeat ingestion error: ${err.message}`);
        res.status(500).json({ error: 'Telemetry heartbeat ingestion failed' });
    }
});

// ---------------------------------------------------------------------------
// Client-side report batch ingestion  (POST /api/telemetry/report)
// ---------------------------------------------------------------------------
router.post('/report', (req, res) => {
    try {
        RuntimeTelemetryService.ingest(req.body);
        res.json({ ok: true });
    } catch (err) {
        logger.error(`[Telemetry] Report ingestion error: ${err.message}`);
        res.status(500).json({ error: 'Telemetry report ingestion failed' });
    }
});

// ---------------------------------------------------------------------------
// Client-side event ingestion  (POST /api/telemetry/event)
// ---------------------------------------------------------------------------
router.post('/event', auth, (req, res) => {
    try {
        const { type, payload = {} } = req.body || {};

        switch (type) {
            case 'error':
                recordError(payload);
                break;
            case 'long_task':
                recordLongTask(payload);
                break;
            case 'active_user':
                recordActiveUser(payload.userId);
                break;
            case 'session_duration':
                if (typeof payload.durationMs === 'number') {
                    recordSessionDuration(payload.durationMs);
                }
                break;
            default:
                // api_call, failed_request etc. are now auto-captured by
                // requestTracing middleware — client-side events just count
                // as ingested totals.
                store.queueBehavior.totalIngested++;
                break;
        }

        res.json({ ok: true });
    } catch (err) {
        logger.error(`[Telemetry] Event ingestion error: ${err.message}`);
        res.status(500).json({ error: 'Telemetry ingestion failed' });
    }
});

// ---------------------------------------------------------------------------
// Overview snapshot  (GET /api/telemetry/overview)  — admin only
// ---------------------------------------------------------------------------
router.get('/overview', auth, adminAuth, async (req, res) => {
    try {
        // Retrieve client/server unified metrics from RuntimeTelemetryService
        const overview = RuntimeTelemetryService.getOverview();

        const mem = process.memoryUsage();
        const uptime = process.uptime();

        // Inject live server-side memory metrics
        overview.memoryMetrics.current = {
            heapUsed: mem.heapUsed,
            heapTotal: mem.heapTotal,
            rss: mem.rss
        };

        // Inject live server system stats
        overview.system = {
            uptime,
            pid: process.pid,
            platform: process.platform,
            cpus: os.cpus().length,
            loadAvg: os.loadavg(),
            freeMemMb: Math.round(os.freemem() / 1024 / 1024),
            totalMemMb: Math.round(os.totalmem() / 1024 / 1024)
        };

        // Fetch live system metrics from OperationsTelemetryService
        let liveMetrics = {};
        try {
            liveMetrics = await OperationsTelemetryService.getLiveNationalMetrics();
        } catch (e) {
            logger.warn(`[Telemetry] Failed to fetch live national metrics: ${e.message}`);
        }
        overview.liveMetrics = liveMetrics;
        overview.timestamp = new Date().toISOString();

        res.json(overview);
    } catch (err) {
        logger.error(`[Telemetry] Overview fetch error: ${err.message}`);
        res.status(500).json({ error: 'Telemetry overview unavailable' });
    }
});

// ---------------------------------------------------------------------------
// Reset  (DELETE /api/telemetry/reset)  — admin only
// ---------------------------------------------------------------------------
router.delete('/reset', auth, adminAuth, (req, res) => {
    reset();
    logger.info('[Telemetry] In-memory telemetry store reset by admin.');
    res.json({ ok: true, message: 'Telemetry store cleared.' });
});
module.exports = router;
