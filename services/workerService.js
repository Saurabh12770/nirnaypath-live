const { createEmailWorker } = require('../workers/emailWorker');
const { createDigestWorker } = require('../workers/digestWorker');

let workersInitialized = false;
let emailWorker = null;
let digestWorker = null;

/**
 * Safely initialize background workers
 */
const initWorkers = () => {
    if (workersInitialized) {
        console.log('[WorkerService] Workers already running. Skipping initialization.');
        return;
    }

    try {
        console.log('[WorkerService] Initializing background workers...');

        // 1. Initialize Email Worker
        emailWorker = createEmailWorker();
        console.log('[WorkerService] Email Worker started.');

        // 2. Initialize Digest Worker
        digestWorker = createDigestWorker();
        console.log('[WorkerService] Digest Worker started.');

        workersInitialized = true;
        console.log('[WorkerService] All workers successfully initialized.');
    } catch (error) {
        console.error('[WorkerService] Failed to initialize workers:', error.message);
    }
};

/**
 * Gracefully shutdown workers
 */
const shutdownWorkers = async () => {
    console.log('[WorkerService] Shutting down workers...');
    if (emailWorker) await emailWorker.close();
    if (digestWorker) await digestWorker.close();
    workersInitialized = false;
    console.log('[WorkerService] Workers shut down.');
};

module.exports = {
    initWorkers,
    shutdownWorkers
};
