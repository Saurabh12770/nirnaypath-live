/**
 * Runtime Protection Middleware
 * Phase 7 - Enterprise Certification
 */

const MemoryPressureService = require('../services/memoryPressureService');
const RuntimeSupervisorService = require('../services/runtimeSupervisorService');

// Map to track duplicate requests (Idempotency Key / Request Hash)
const requestTracker = new Map();

const RuntimeProtection = {

    /**
     * 1. Payload Size Limits
     */
    enforcePayloadLimit(req, res, next) {
        const contentLength = req.headers['content-length'];
        if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) { // 5MB Limit
            RuntimeSupervisorService.logTrace({ type: 'PAYLOAD_REJECTED', size: contentLength, path: req.path });
            return res.status(413).json({ success: false, error: 'Payload too large' });
        }
        next();
    },

    /**
     * 3. Request Timeout Protection
     */
    enforceTimeout(req, res, next) {
        req.setTimeout(15000, () => { // 15 seconds
            RuntimeSupervisorService.logTrace({ type: 'REQUEST_TIMEOUT', path: req.path });
            if (!res.headersSent) {
                res.status(503).json({ success: false, error: 'Request Timeout - Service Unavailable' });
            }
        });
        next();
    },

    /**
     * 4. Duplicate Request Protection (Idempotency/Spam)
     */
    preventDuplicates(req, res, next) {
        if (req.method === 'GET') return next();

        const reqHash = `${req.ip}_${req.path}_${JSON.stringify(req.body || {})}`;
        const now = Date.now();

        if (requestTracker.has(reqHash)) {
            const lastTime = requestTracker.get(reqHash);
            if (now - lastTime < 2000) { // 2 seconds debounce
                RuntimeSupervisorService.logTrace({ type: 'DUPLICATE_REQUEST_BLOCKED', path: req.path, ip: req.ip });
                return res.status(429).json({ success: false, error: 'Too Many Requests - Please wait.' });
            }
        }

        requestTracker.set(reqHash, now);

        // Cleanup tracker periodically
        if (requestTracker.size > 10000) {
            const expire = now - 5000;
            for (const [key, val] of requestTracker.entries()) {
                if (val < expire) requestTracker.delete(key);
            }
        }

        next();
    },

    /**
     * 5. Backpressure Enforcer
     */
    enforceBackpressure(req, res, next) {
        // Only throttle heavy routes (like batch generation or large analytics) under pressure
        const heavyRoutes = ['/api/review/approve', '/api/generate', '/api/analytics'];
        const isHeavy = heavyRoutes.some(r => req.path.includes(r));

        if (isHeavy && MemoryPressureService.checkRuntimeBackpressure()) {
            return res.status(503).json({ success: false, error: 'System is under heavy load. Please try again later.' });
        }
        next();
    }
};

module.exports = RuntimeProtection;
