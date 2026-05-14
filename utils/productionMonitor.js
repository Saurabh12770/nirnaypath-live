const mongoose = require('mongoose');
const os = require('os');

/**
 * NirnayPath Production Monitoring & Observability Module (Phase 10)
 * Tracks system health, performance metrics, and runtime stability.
 */
class ProductionMonitor {
    constructor() {
        this.startTime = Date.now();
        this.metrics = {
            apiLatencies: [],
            dbLatencies: [],
            reconnects: { mongo: 0, redis: 0 },
            errors: { uncaught: 0, unhandled: 0 }
        };
    }

    /**
     * Get real-time system metrics
     */
    getSystemStats() {
        const memory = process.memoryUsage();
        return {
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            memory: {
                rss: Math.round(memory.rss / 1024 / 1024) + 'MB',
                heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
                heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
                external: Math.round(memory.external / 1024 / 1024) + 'MB'
            },
            cpu: os.loadavg(),
            process: {
                pid: process.pid,
                nodeVersion: process.version,
                platform: process.platform
            }
        };
    }

    /**
     * Get Database Health
     */
    async getDatabaseStats() {
        const mongoState = mongoose.connection.readyState;
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        
        return {
            mongo: {
                status: states[mongoState] || 'unknown',
                dbName: mongoose.connection.name,
                poolSize: mongoose.connection.base?.options?.maxPoolSize || 'default',
                reconnectCount: this.metrics.reconnects.mongo
            }
        };
    }

    /**
     * Record API Latency
     */
    recordApiLatency(ms) {
        this.metrics.apiLatencies.push(ms);
        if (this.metrics.apiLatencies.length > 100) this.metrics.apiLatencies.shift();
    }

    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;
        return {
            avgApiLatency: avg(this.metrics.apiLatencies) + 'ms',
            maxApiLatency: Math.max(...this.metrics.apiLatencies, 0) + 'ms',
            errorCounts: this.metrics.errors
        };
    }

    /**
     * Middleware for tracking latency
     */
    latencyTracker() {
        return (req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                this.recordApiLatency(duration);
            });
            next();
        };
    }
}

const monitor = new ProductionMonitor();

// Global Process Handlers for Observability
process.on('uncaughtException', (err) => {
    monitor.metrics.errors.uncaught++;
    console.error('[CRITICAL] Uncaught Exception:', err.stack);
    // Note: app.js will handle graceful exit
});

process.on('unhandledRejection', (reason, promise) => {
    monitor.metrics.errors.unhandled++;
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = monitor;
