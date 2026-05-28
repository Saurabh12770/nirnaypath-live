'use strict';

const { getCorrelationId } = require('../middleware/requestTracing');

class ProductionTelemetryEngine {
    constructor() {
        this.routeTimings = []; // [{ route, duration, status, correlationId, timestamp }]
        this.slowQueries = [];  // [{ collection, operation, latencyMs, correlationId, timestamp }]
        this.errors = [];       // [{ message, code, context, correlationId, timestamp }]
        this.memorySnapshots = []; // [{ rss, heapTotal, heapUsed, external, timestamp }]
        this.eventLoopLag = 0;     // Current lag in ms
        this.activeConnections = 0;
        this.workerFailures = []; // [{ queueName, jobId, error, timestamp }]
        this.maxStoredLogs = 100;

        // Monitor event loop lag
        let lastTime = Date.now();
        setInterval(() => {
            const now = Date.now();
            const lag = Math.max(0, now - lastTime - 1000);
            this.eventLoopLag = (this.eventLoopLag * 0.9) + (lag * 0.1); // EMA
            lastTime = now;
        }, 1000).unref();
    }

    recordRouteTiming(route, duration, status) {
        const record = {
            route,
            duration,
            status,
            correlationId: getCorrelationId() || 'N/A',
            timestamp: new Date().toISOString()
        };
        this.routeTimings.push(record);
        if (this.routeTimings.length > this.maxStoredLogs) {
            this.routeTimings.shift();
        }
    }

    recordSlowQuery(collection, operation, latencyMs, filter = {}) {
        const record = {
            collection,
            operation,
            latencyMs,
            correlationId: getCorrelationId() || 'N/A',
            filter: JSON.stringify(filter).slice(0, 100),
            timestamp: new Date().toISOString()
        };
        this.slowQueries.push(record);
        if (this.slowQueries.length > this.maxStoredLogs) {
            this.slowQueries.shift();
        }
    }

    recordError(message, code, context = {}) {
        const record = {
            message,
            code,
            context,
            correlationId: getCorrelationId() || 'N/A',
            timestamp: new Date().toISOString()
        };
        this.errors.push(record);
        if (this.errors.length > this.maxStoredLogs) {
            this.errors.shift();
        }
    }

    recordWorkerFailure(queueName, jobId, error) {
        const record = {
            queueName,
            jobId,
            error: error?.message || String(error),
            timestamp: new Date().toISOString()
        };
        this.workerFailures.push(record);
        if (this.workerFailures.length > this.maxStoredLogs) {
            this.workerFailures.shift();
        }
    }

    takeMemorySnapshot() {
        const mem = process.memoryUsage();
        const record = {
            rss: Math.round(mem.rss / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            external: Math.round(mem.external / 1024 / 1024),
            timestamp: new Date().toISOString()
        };
        this.memorySnapshots.push(record);
        if (this.memorySnapshots.length > this.maxStoredLogs) {
            this.memorySnapshots.shift();
        }
        return record;
    }

    getLiveMetrics() {
        this.takeMemorySnapshot();
        const latestMem = this.memorySnapshots[this.memorySnapshots.length - 1] || {};

        return {
            eventLoopLagMs: Math.round(this.eventLoopLag * 100) / 100,
            memory: latestMem,
            counters: {
                activeConnections: this.activeConnections,
                totalErrorsRecorded: this.errors.length,
                totalSlowQueriesRecorded: this.slowQueries.length,
                totalWorkerFailuresRecorded: this.workerFailures.length
            },
            recentSlowQueries: this.slowQueries.slice(-10).reverse(),
            recentRouteLatency: this.routeTimings.slice(-10).reverse(),
            recentWorkerFailures: this.workerFailures.slice(-10).reverse()
        };
    }
}

module.exports = new ProductionTelemetryEngine();
