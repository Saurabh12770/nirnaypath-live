const { getRedisClient, isRedisAvailable } = require('./redisService');
const os = require('os');
const logger = require('../utils/logger');

class OperationsTelemetryService {
    constructor() {
    }

    async getLiveNationalMetrics() {
        const redis = getRedisClient();
        if (!redis || !isRedisAvailable()) {
            logger.warn('[OPERATIONS] Redis unavailable, returning fallback metrics');
            return this.getFallbackMetrics();
        }

        try {
            return {
                activeCandidates: parseInt(await redis.get('metrics:active_candidates') || '0', 10),
                activeExams: await redis.scard('metrics:active_exams') || 0,
                regionalLoad: await redis.hgetall('metrics:regional_load') || {},
                pm2ClusterHealth: await this.getPM2Health(),
                redisStreamDepth: await redis.xlen('telemetry:heartbeat_stream') || 0,
                mongoReplicationLag: await this.getMongoLag(),
                queueBackpressure: await redis.llen('queue:exam_submissions') || 0,
                averageHeartbeatRTT: parseFloat(await redis.get('metrics:avg_rtt') || '0'),
                eventLoopLag: await this.getEventLoopLag(),
                suspiciousActivitySpikes: parseInt(await redis.get('metrics:suspicious_spikes') || '0', 10),
                activeFraudReviews: parseInt(await redis.get('metrics:active_fraud_reviews') || '0', 10),
                waitRoomCounts: await redis.hgetall('metrics:wait_rooms') || {},
                systemStatus: 'ONLINE'
            };
        } catch (error) {
            logger.error(`[OPERATIONS] Error fetching telemetry: ${error.message}`);
            return this.getFallbackMetrics();
        }
    }

    getFallbackMetrics() {
        return {
            activeCandidates: 0,
            activeExams: 0,
            regionalLoad: {},
            pm2ClusterHealth: { status: 'unknown', workers: 0, memory: 0 },
            redisStreamDepth: 0,
            mongoReplicationLag: { lagMs: 0 },
            queueBackpressure: 0,
            averageHeartbeatRTT: 0,
            eventLoopLag: 0,
            suspiciousActivitySpikes: 0,
            activeFraudReviews: 0,
            waitRoomCounts: {},
            systemStatus: 'DEGRADED'
        };
    }

    async getPM2Health() {
        return {
            status: 'healthy',
            workers: os.cpus().length,
            memory: process.memoryUsage().heapUsed,
            uptime: process.uptime()
        };
    }

    async getMongoLag() {
        // In a real environment, query replSetGetStatus
        return { lagMs: Math.floor(Math.random() * 5) };
    }

    async getEventLoopLag() {
        return new Promise((resolve) => {
            const start = Date.now();
            setImmediate(() => {
                resolve(Date.now() - start);
            });
        });
    }

    // Emergency Controls
    async pauseExamNationally(examId, adminId) {
        const redis = getRedisClient();
        if (redis && isRedisAvailable()) {
            await redis.set(`exam:${examId}:status`, 'PAUSED_NATIONALLY');
            await this.logEmergencyAction('PAUSE_NATIONALLY', examId, null, adminId);
            logger.warn(`[EMERGENCY] Exam ${examId} paused nationally by admin ${adminId}`);
            return true;
        }
        return false;
    }

    async pauseRegion(examId, region, adminId) {
        const redis = getRedisClient();
        if (redis && isRedisAvailable()) {
            await redis.hset(`exam:${examId}:regions`, region, 'PAUSED');
            await this.logEmergencyAction('PAUSE_REGION', examId, region, adminId);
            logger.warn(`[EMERGENCY] Exam ${examId} region ${region} paused by admin ${adminId}`);
            return true;
        }
        return false;
    }

    async extendTimer(examId, additionalMinutes, adminId) {
        const redis = getRedisClient();
        if (redis && isRedisAvailable()) {
            await redis.incrby(`exam:${examId}:timer_extension`, additionalMinutes);
            await this.logEmergencyAction('EXTEND_TIMER', examId, { minutes: additionalMinutes }, adminId);
            logger.info(`[EMERGENCY] Exam ${examId} timer extended by ${additionalMinutes}m by admin ${adminId}`);
            return true;
        }
        return false;
    }

    async logEmergencyAction(action, target, context, adminId) {
        const redis = getRedisClient();
        if (redis && isRedisAvailable()) {
            const payload = {
                action, target, context, adminId, timestamp: Date.now()
            };
            await redis.xadd('audit:emergency_actions', '*', 'data', JSON.stringify(payload));
        }
    }
}

module.exports = new OperationsTelemetryService();
