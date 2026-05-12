const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const context = require('../utils/context');
const logger = require('../utils/logger');

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
        // Stop retrying after 3 failures to prevent log spam in dev/test
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
    }
});

connection.on('error', (err) => {
    // Only log once or twice
    if (!global.redisLoggedError) {
        console.warn('[Queue] Redis connection failed. Queueing will be disabled/limited.');
        global.redisLoggedError = true;
    }
});

// 1. Email Queue
const emailQueue = new Queue('email-queue', { connection, defaultJobOptions: { removeOnComplete: true } });

// 2. Digest Queue (for long-running batch jobs)
const digestQueue = new Queue('digest-queue', { connection, defaultJobOptions: { removeOnComplete: true } });

/**
 * Add email job to queue with safety and context tracking
 */
const addEmailJob = async (type, data) => {
    const store = context.getStore() || {};
    
    // Inject observability metadata without polluting core business data
    const metadata = {
        requestId: store.requestId,
        userId: store.userId,
        emailType: type,
        enqueuedAt: Date.now()
    };

    await emailQueue.add(type, { ...data, _metadata: metadata }, {
        attempts: 5,
        // Intelligent Backoff: Start at 2s, cap at 30s
        backoff: { 
            type: 'exponential', 
            delay: 2000 
        },
        removeOnComplete: true
    });
    
    logger.info(`Email job enqueued: ${type}`, { type, recipient: data.to });
};

/**
 * Add digest job to queue
 */
const addDigestJob = async (type, data) => {
    await digestQueue.add(type, data, {
        attempts: 1,
        removeOnComplete: true
    });
};

/**
 * Global Queue Observability Listeners
 */
emailQueue.on('error', (err) => logger.error('Global Queue Error', { error: err.message }));
emailQueue.on('waiting', (jobId) => logger.info(`Job ${jobId} is waiting`));

module.exports = {
    emailQueue,
    digestQueue,
    addEmailJob,
    addDigestJob,
    connection
};
