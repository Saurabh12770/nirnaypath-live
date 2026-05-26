'use strict';
/**
 * utils/telemetryStore.js
 * Singleton in-memory telemetry accumulator.
 * Shared between requestTracing middleware (writes) and routes/telemetry (reads).
 * No external dependencies — safe to require anywhere in the process.
 */

const RuntimeTelemetryService = require('../services/runtimeTelemetryService');

const MAX_QUEUE = 500;
const SLOW_API_THRESHOLD_MS = 1000; // requests slower than 1s are "slow"

const store = {
    // Per-request API metrics: url -> { count, sum, min, max, failed }
    apiMetrics: {},

    // Raw event queues
    errors: [],
    failedRequests: [],
    slowApis: [],
    longTasks: [],
    memorySnapshots: [],
    sessionDurations: [],
    activeUsers: new Set(),

    // Queue accounting
    queueBehavior: {
        maxSizePerQueue: MAX_QUEUE,
        currentSizeTotal: 0,
        evictionCount: 0,
        droppedEvents: 0,
        totalIngested: 0,
        startTime: Date.now()
    }
};

/** Push item to a bounded queue; evict oldest if full. */
function pushBounded(queue, item) {
    queue.push(item);
    store.queueBehavior.totalIngested++;
    if (queue.length > MAX_QUEUE) {
        queue.shift();
        store.queueBehavior.evictionCount++;
    }
}

/**
 * Called by requestTracing middleware on every completed HTTP request.
 * @param {object} opts
 * @param {string} opts.url       - Request path (no query string)
 * @param {string} opts.method    - HTTP method
 * @param {number} opts.status    - HTTP status code
 * @param {number} opts.durationMs - Request duration in ms
 */
function recordRequest({ url, method, status, durationMs }) {
    // 1. API metrics
    const key = `${method} ${url}`;
    if (!store.apiMetrics[key]) {
        store.apiMetrics[key] = { count: 0, sum: 0, min: Infinity, max: -Infinity, failed: 0 };
    }
    const m = store.apiMetrics[key];
    m.count++;
    m.sum += durationMs;
    m.min = Math.min(m.min, durationMs);
    m.max = Math.max(m.max, durationMs);

    // 2. Failed request tracking (4xx / 5xx)
    if (status >= 400) {
        m.failed++;
        pushBounded(store.failedRequests, { url: key, status, durationMs, ts: Date.now() });
    }

    // 3. Slow API detection
    if (durationMs >= SLOW_API_THRESHOLD_MS) {
        pushBounded(store.slowApis, { url: key, durationMs, status, ts: Date.now() });
    }

    // Sync queue size counter
    store.queueBehavior.currentSizeTotal =
        store.errors.length +
        store.failedRequests.length +
        store.slowApis.length +
        store.longTasks.length;

    // Delegate to RuntimeTelemetryService
    try {
        RuntimeTelemetryService.ingest({
            sessionId: 'server',
            events: [{
                type: 'api',
                url: key,
                duration: durationMs,
                status
            }]
        });
    } catch(e){}
}

/**
 * Called when a JS error is captured (e.g. by crashReportingService or error handler).
 */
function recordError(errorInfo) {
    pushBounded(store.errors, { ...errorInfo, ts: Date.now() });
    store.queueBehavior.currentSizeTotal =
        store.errors.length +
        store.failedRequests.length +
        store.slowApis.length +
        store.longTasks.length;

    // Delegate to RuntimeTelemetryService
    try {
        RuntimeTelemetryService.ingest({
            sessionId: 'server',
            events: [{
                type: 'error',
                message: errorInfo.message || String(errorInfo),
                source: errorInfo.source || 'server',
                lineno: errorInfo.lineno,
                colno: errorInfo.colno,
                error: errorInfo.error || errorInfo.stack
            }]
        });
    } catch(e){}
}

/**
 * Called for long-running tasks (>50ms event-loop blocks).
 */
function recordLongTask(taskInfo) {
    pushBounded(store.longTasks, { ...taskInfo, ts: Date.now() });
    try {
        RuntimeTelemetryService.ingest({
            sessionId: 'server',
            events: [{
                type: 'longtask',
                duration: taskInfo.duration,
                name: taskInfo.name,
                timestamp: taskInfo.ts || Date.now()
            }]
        });
    } catch(e){}
}

/**
 * Record an active user session.
 */
function recordActiveUser(userId) {
    if (userId) {
        store.activeUsers.add(String(userId));
        try {
            RuntimeTelemetryService.stats.activeUsers.add(String(userId));
        } catch(e){}
    }
}

/**
 * Record a session duration (ms) when a session ends.
 */
function recordSessionDuration(durationMs) {
    store.sessionDurations.push(durationMs);
    if (store.sessionDurations.length > 1000) store.sessionDurations.shift();
    try {
        RuntimeTelemetryService.stats.sessionDurations.push({ sessionId: 'server', durationMs, timestamp: Date.now() });
    } catch(e){}
}

/**
 * Take a memory snapshot and append to memorySnapshots.
 */
function snapshotMemory() {
    const mem = process.memoryUsage();
    store.memorySnapshots.push({ heapUsed: mem.heapUsed, heapTotal: mem.heapTotal, rss: mem.rss, ts: Date.now() });
    if (store.memorySnapshots.length > 200) store.memorySnapshots.shift();
}

/**
 * Reset all in-memory telemetry (admin-only use).
 */
function reset() {
    store.errors.length = 0;
    store.failedRequests.length = 0;
    store.slowApis.length = 0;
    store.longTasks.length = 0;
    store.memorySnapshots.length = 0;
    store.sessionDurations.length = 0;
    store.activeUsers.clear();
    Object.keys(store.apiMetrics).forEach(k => delete store.apiMetrics[k]);
    store.queueBehavior.totalIngested = 0;
    store.queueBehavior.currentSizeTotal = 0;
    store.queueBehavior.evictionCount = 0;
    store.queueBehavior.droppedEvents = 0;
    store.queueBehavior.startTime = Date.now();

    try {
        RuntimeTelemetryService.reset();
    } catch(e){}
}

module.exports = { store, recordRequest, recordError, recordLongTask, recordActiveUser, recordSessionDuration, snapshotMemory, reset };
