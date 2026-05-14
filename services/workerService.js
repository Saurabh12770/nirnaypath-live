const { createEmailWorker } = require('../workers/emailWorker');
const { createDigestWorker } = require('../workers/digestWorker');
const { isRedisAvailable } = require('./redisService');
const logger = require('../utils/logger');

let _initialized = false;
let emailWorker = null;
let digestWorker = null;

const initWorkers = () => {
    if (_initialized) return;
    if (process.env.ENABLE_WORKERS === 'false') {
        logger.warn('[WORKER] Disabled via ENABLE_WORKERS=false.');
        return;
    }
    if (!isRedisAvailable()) {
        logger.warn('[WORKER] Redis not ready. Workers dormant.');
        return;
    }
    try {
        logger.info('[WORKER] Initializing workers...');
        emailWorker = createEmailWorker();
        logger.info('[WORKER] Email worker started.');
        digestWorker = createDigestWorker();
        logger.info('[WORKER] Digest worker started.');
        _initialized = true;
        logger.info('[WORKER] All workers running.');
    } catch (err) {
        logger.error('[WORKER] Init failed (non-fatal):', { error: err.message });
    }
};

const shutdownWorkers = async () => {
    logger.info('[WORKER] Shutting down...');
    await Promise.allSettled([
        emailWorker?.close().catch(e => logger.error('[WORKER] Email close error:', { error: e.message })),
        digestWorker?.close().catch(e => logger.error('[WORKER] Digest close error:', { error: e.message })),
    ]);
    _initialized = false;
    logger.info('[WORKER] All workers stopped.');
};

module.exports = { initWorkers, shutdownWorkers };
