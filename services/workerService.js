const { createEmailWorker } = require('../workers/emailWorker');
const { createDigestWorker } = require('../workers/digestWorker');
const { isRedisAvailable } = require('./redisService');
const logger = require('../utils/logger');

let workersInitialized = false;
let emailWorker = null;
let digestWorker = null;

/**
 * Safely initialize background workers
 */
const initWorkers = () => {
    // 1. Check if already initialized
    if (workersInitialized) {
        logger.info('[WorkerService] Workers already running. Skipping initialization.');
        return;
    }

    // 2. Check Feature Flag
    if (process.env.ENABLE_WORKERS === 'false') {
        logger.warn('[WorkerService] Workers are explicitly disabled via ENABLE_WORKERS flag.');
        return;
    }

    // 3. Check Redis Availability
    if (!isRedisAvailable()) {
        logger.error('[WorkerService] Cannot start workers: Redis is unavailable. Workers will remain dormant.');
        return;
    }

    try {
        logger.info('[WorkerService] Initializing background workers...');

        // 1. Initialize Email Worker
        emailWorker = createEmailWorker();
        logger.info('[WorkerService] Email Worker started.');

        // 2. Initialize Digest Worker
        digestWorker = createDigestWorker();
        logger.info('[WorkerService] Digest Worker started.');

        workersInitialized = true;
        logger.info('[WorkerService] All workers successfully initialized.');
    } catch (error) {
        logger.error('[WorkerService] Failed to initialize workers:', { error: error.message });
    }
};

/**
 * Gracefully shutdown workers
 */
const shutdownWorkers = async () => {
    logger.info('[WorkerService] Shutting down workers...');
    try {
        if (emailWorker) await emailWorker.close();
        if (digestWorker) await digestWorker.close();
        workersInitialized = false;
        logger.info('[WorkerService] Workers shut down.');
    } catch (error) {
        logger.error('[WorkerService] Error during worker shutdown:', { error: error.message });
    }
};

module.exports = {
    initWorkers,
    shutdownWorkers
};
