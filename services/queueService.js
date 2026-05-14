const { Queue } = require('bullmq');
const { initRedis, getRedisClient, isRedisAvailable } = require('./redisService');
const context = require('../utils/context');
const logger = require('../utils/logger');

let emailQueue = null;
let digestQueue = null;
let _initialized = false;

const initQueues = () => {
    if (_initialized) return;
    if (process.env.ENABLE_QUEUE === 'false') {
        logger.warn('[QUEUE] Disabled via ENABLE_QUEUE=false.');
        return;
    }
    const connection = getRedisClient();
    if (!connection) {
        logger.error('[QUEUE] Redis client unavailable. Queue system will not start.');
        return;
    }
    try {
        emailQueue = new Queue('email-queue', {
            connection,
            defaultJobOptions: {
                removeOnComplete: true,
                attempts: 5,
                backoff: { type: 'exponential', delay: 2000 },
            },
        });

        digestQueue = new Queue('digest-queue', {
            connection,
            defaultJobOptions: { removeOnComplete: true, attempts: 1 },
        });

        emailQueue.on('error', (err) => logger.error('[QUEUE] Email queue error', { error: err.message }));
        digestQueue.on('error', (err) => logger.error('[QUEUE] Digest queue error', { error: err.message }));

        _initialized = true;
        logger.info('[QUEUE] BullMQ queues initialized successfully.');
    } catch (err) {
        logger.error('[QUEUE] Queue initialization failed', { error: err.message });
    }
};

// Trigger Redis init and queue setup
initRedis();
// Defer queue init slightly to allow Redis 'ready' event to fire
setTimeout(initQueues, 2000);

/**
 * Add email job. No-op (returns null) when Redis is unavailable.
 */
const addEmailJob = async (type, data) => {
    if (!emailQueue || !isRedisAvailable()) {
        logger.warn(`[QUEUE] Skipping email job "${type}" — Redis/Queue unavailable.`);
        return null;
    }
    try {
        const store = context.getStore() || {};
        const metadata = {
            requestId: store.requestId,
            userId: store.userId,
            emailType: type,
            enqueuedAt: Date.now(),
        };
        const job = await emailQueue.add(type, { ...data, _metadata: metadata });
        logger.info(`[QUEUE] Email job enqueued: ${type}`, { jobId: job.id, recipient: data.to });
        return job;
    } catch (err) {
        logger.error(`[QUEUE] Failed to enqueue email job "${type}"`, { error: err.message });
        return null;
    }
};

/**
 * Add digest job. No-op (returns null) when Redis is unavailable.
 */
const addDigestJob = async (type, data) => {
    if (!digestQueue || !isRedisAvailable()) {
        logger.warn(`[QUEUE] Skipping digest job "${type}" — Redis/Queue unavailable.`);
        return null;
    }
    try {
        const job = await digestQueue.add(type, data);
        logger.info(`[QUEUE] Digest job enqueued: ${type}`, { jobId: job.id });
        return job;
    } catch (err) {
        logger.error(`[QUEUE] Failed to enqueue digest job "${type}"`, { error: err.message });
        return null;
    }
};

// getConnection() for workers that need the raw ioredis client
const getConnection = () => getRedisClient();

module.exports = {
    get emailQueue() { return emailQueue; },
    get digestQueue() { return digestQueue; },
    addEmailJob,
    addDigestJob,
    initQueues,
    getConnection,
    // Legacy alias for any code that destructures { connection }
    get connection() { return getRedisClient(); },
};
