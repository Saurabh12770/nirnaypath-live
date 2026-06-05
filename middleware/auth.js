const jwt = require('jsonwebtoken');
const User = require('../models/user');

// PHASE-4A FIX: Check JWT_SECRET at module load time, not per-request.
// This prevents a single request from killing the entire production process.
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET must be set in production.');
    process.exit(1);
}
const jwtSecret = process.env.JWT_SECRET;

// Map to coalesce in-flight user database lookups under concurrent request load
const inFlightUserLookups = new Map();

const parseCookies = (cookieHeader) => {
    const list = {};
    if (!cookieHeader) return list;
    cookieHeader.split(';').forEach(cookie => {
        let [name, ...rest] = cookie.split('=');
        name = name.trim();
        if (!name) return;
        const val = rest.join('=').trim();
        list[name] = decodeURIComponent(val);
    });
    return list;
};

// Fast synchronous cache for verified tokens to bypass CPU-heavy crypto operations under burst load
const verifiedTokenCache = new Map();

const auth = async (req, res, next) => {
    try {
        let token = null;
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader !== 'Bearer null' && authHeader !== 'Bearer undefined') {
            token = authHeader.replace('Bearer ', '');
        } else if (req.headers.cookie) {
            const cookies = parseCookies(req.headers.cookie);
            token = cookies.token;
        }

        if (!token) {
            return res.status(401).json({ error: 'Please authenticate.', code: 'NO_TOKEN' });
        }

        // PHASE-4A FIX: secret is validated at module load; use cached reference.
        // If somehow cleared at runtime, return 500 — never kill the process.
        if (!jwtSecret) {
            console.error('CRITICAL: JWT_SECRET became undefined at runtime.');
            return res.status(500).json({ error: 'Authentication service temporarily unavailable.', code: 'AUTH_CONFIG_ERROR' });
        }

        let decoded = verifiedTokenCache.get(token);
        if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
            try {
                decoded = jwt.verify(token, jwtSecret);
                if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
                    verifiedTokenCache.set(token, decoded);
                }
            } catch (jwtError) {
                // Remove expired/invalid from cache if present
                verifiedTokenCache.delete(token);

                // PHASE-4A FIX: Differentiate JWT error types
                if (jwtError.name === 'TokenExpiredError') {
                    return res.status(401).json({ error: 'Token has expired. Please refresh your session.', code: 'TOKEN_EXPIRED' });
                }
                if (jwtError.name === 'JsonWebTokenError') {
                    return res.status(400).json({ error: 'Invalid authentication token.', code: 'TOKEN_MALFORMED' });
                }
                if (jwtError.name === 'NotBeforeError') {
                    return res.status(401).json({ error: 'Token is not yet active.', code: 'TOKEN_NOT_ACTIVE' });
                }
                return res.status(401).json({ error: 'Token verification failed.', code: 'TOKEN_INVALID' });
            }
        }

        // Coalesce concurrent user lookups for the same ID to prevent DB thrashing under high concurrency
        let user;
        try {
            const cacheKey = decoded.id;
            if (inFlightUserLookups.has(cacheKey)) {
                user = await inFlightUserLookups.get(cacheKey);
            } else {
                const promise = User.findById(decoded.id).exec();
                inFlightUserLookups.set(cacheKey, promise);
                try {
                    user = await promise;
                } finally {
                    inFlightUserLookups.delete(cacheKey);
                }
            }
        } catch (dbError) {
            // PHASE-4A FIX: Database errors should not be masked as auth failures
            console.error('[AUTH] Database error during user lookup:', dbError.message);
            return res.status(503).json({ error: 'Authentication service temporarily unavailable.', code: 'DB_ERROR' });
        }

        if (!user) {
            return res.status(401).json({ error: 'User account not found.', code: 'USER_NOT_FOUND' });
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        // PHASE-4A FIX: Catch-all for truly unexpected errors — log and return 500
        console.error('[AUTH] Unhandled middleware error:', error.message, error.stack);
        res.status(500).json({ error: 'Internal authentication error.', code: 'AUTH_INTERNAL_ERROR' });
    }
};

module.exports = auth;
