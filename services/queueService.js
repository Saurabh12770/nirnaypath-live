const { Queue } = require('bullmq');
const { initRedis, getRedisClient, isRedisAvailable } = require('./redisService');

let emailQueue = null;
let digestQueue = null;
let _initialized = false;

const initQueues = () => {
    if (_initialized) return;
    if (process.env.ENABLE_QUEUE === 'false') {
        console.log('[QUEUE] Disabled via ENABLE_QUEUE=false.');
        return;
    }
    const connection = getRedisClient();
    if (!connection) {
        console.error('[QUEUE] Redis unavailable. Queue system not started.');
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
        emailQueue.on('error', (err) => console.error('[QUEUE] Email error:', err.message));
        digestQueue.on('error', (err) => console.error('[QUEUE] Digest error:', err.message));
        _initialized = true;
        console.log('[QUEUE] BullMQ queues initialized.');
    } catch (err) {
        console.error('[QUEUE] Init failed:', err.message);
    }
};

initRedis();
initQueues();

const addEmailJob = async (type, data) => {
    if (!emailQueue || !isRedisAvailable()) {
        console.warn(`[QUEUE] Skipping email job "${type}" — Redis/Queue unavailable.`);
        return null;
    }
    try {
        const job = await emailQueue.add(type, { ...data, _type: type });
        console.log(`[QUEUE] Email job enqueued: ${type} (id:${job.id})`);
        return job;
    } catch (err) {
        console.error(`[QUEUE] Failed to enqueue "${type}":`, err.message);
        return null;
    }
};

const addDigestJob = async (type, data) => {
    if (!digestQueue || !isRedisAvailable()) {
        console.warn(`[QUEUE] Skipping digest job "${type}" — Redis/Queue unavailable.`);
        return null;
    }
    try {
        const job = await digestQueue.add(type, data);
        console.log(`[QUEUE] Digest job enqueued: ${type} (id:${job.id})`);
        return job;
    } catch (err) {
        console.error(`[QUEUE] Failed to enqueue digest "${type}":`, err.message);
        return null;
    }
};

const getConnection = () => getRedisClient();

module.exports = {
    get emailQueue() { return emailQueue; },
    get digestQueue() { return digestQueue; },
    addEmailJob,
    addDigestJob,
    initQueues,
    getConnection,
    get connection() { return getRedisClient(); },
};
