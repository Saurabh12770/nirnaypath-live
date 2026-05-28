'use strict';

const mongoose = require('mongoose');
const telemetryEngine = require('./productionTelemetryEngine');
const { isRedisAvailable, getRedisClient } = require('./redisService');

class RuntimeMetricsService {
    getOverviewSnapshot() {
        return telemetryEngine.getLiveMetrics();
    }

    getRecentSlowQueries() {
        return telemetryEngine.slowQueries.slice().reverse();
    }

    async getSystemLiveHealth() {
        let databaseHealth = 'DEGRADED';
        let databasePing = -1;
        try {
            const start = Date.now();
            if (mongoose.connection.readyState === 1) {
                await mongoose.connection.db.admin().ping();
                databasePing = Date.now() - start;
                databaseHealth = 'HEALTHY';
            }
        } catch (e) {
            databaseHealth = 'CRITICAL';
        }

        let redisHealth = 'DEGRADED';
        let redisPing = -1;
        try {
            const start = Date.now();
            if (isRedisAvailable()) {
                await getRedisClient().ping();
                redisPing = Date.now() - start;
                redisHealth = 'HEALTHY';
            }
        } catch (e) {
            redisHealth = 'CRITICAL';
        }

        const isProduction = process.env.NODE_ENV === 'production';
        const hasSentry = !!process.env.SENTRY_DSN;

        return {
            status: (databaseHealth === 'HEALTHY' && (redisHealth === 'HEALTHY' || !isProduction)) ? 'HEALTHY' : 'DEGRADED',
            timestamp: new Date().toISOString(),
            systems: {
                database: {
                    status: databaseHealth,
                    pingMs: databasePing,
                    poolSize: mongoose.connection.base?.options?.maxPoolSize || 100
                },
                cache: {
                    status: redisHealth,
                    pingMs: redisPing
                },
                sentry: {
                    active: hasSentry,
                    degradationHandling: true
                },
                eventLoop: {
                    status: telemetryEngine.eventLoopLag < 50 ? 'HEALTHY' : 'SATURATED',
                    lagMs: Math.round(telemetryEngine.eventLoopLag)
                }
            }
        };
    }
}

module.exports = new RuntimeMetricsService();
