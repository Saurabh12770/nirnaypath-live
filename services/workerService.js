const { createEmailWorker } = require('../workers/emailWorker');
const { createDigestWorker } = require('../workers/digestWorker');
const { isRedisAvailable } = require('./redisService');

let _initialized = false;
let emailWorker = null;
let digestWorker = null;

const initWorkers = () => {
    if (_initialized) return;
    if (process.env.ENABLE_WORKERS === 'false') {
        console.log('[WORKER] Disabled via ENABLE_WORKERS=false.');
        return;
    }
    if (!isRedisAvailable()) {
        console.warn('[WORKER] Redis not ready. Workers dormant.');
        return;
    }
    try {
        console.log('[WORKER] Initializing workers...');
        emailWorker = createEmailWorker();
        console.log('[WORKER] Email worker started.');
        digestWorker = createDigestWorker();
        console.log('[WORKER] Digest worker started.');
        _initialized = true;
        console.log('[WORKER] All workers running.');
    } catch (err) {
        console.error('[WORKER] Init failed (non-fatal):', err.message);
    }
};

const shutdownWorkers = async () => {
    console.log('[WORKER] Shutting down...');
    await Promise.allSettled([
        emailWorker?.close().catch(e => console.error('[WORKER] Email close error:', e.message)),
        digestWorker?.close().catch(e => console.error('[WORKER] Digest close error:', e.message)),
    ]);
    _initialized = false;
    console.log('[WORKER] All workers stopped.');
};

module.exports = { initWorkers, shutdownWorkers };
