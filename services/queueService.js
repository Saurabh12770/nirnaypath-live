const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

// 1. Email Queue
const emailQueue = new Queue('email-queue', { connection });

// 2. Digest Queue (for long-running batch jobs)
const digestQueue = new Queue('digest-queue', { connection });

/**
 * Add email job to queue
 */
const addEmailJob = async (type, data) => {
    await emailQueue.add(type, data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 }
    });
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

module.exports = {
    emailQueue,
    digestQueue,
    addEmailJob,
    addDigestJob,
    connection
};
