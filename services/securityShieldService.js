'use strict';

const { isRedisAvailable, getRedisClient } = require('./redisService');

class SecurityShieldService {
    /**
     * Enforces rate limiting on key actions using Redis token buckets.
     * Fallbacks to memory tracking if Redis is unavailable.
     */
    async isRateLimited(key, maxRequests = 20, windowSeconds = 60) {
        if (!isRedisAvailable()) {
            // Local fallback
            if (!global.__localRateLimits) global.__localRateLimits = new Map();
            const now = Date.now();
            const record = global.__localRateLimits.get(key) || [];
            const fresh = record.filter(t => now - t < windowSeconds * 1000);
            fresh.push(now);
            global.__localRateLimits.set(key, fresh);
            return fresh.length > maxRequests;
        }

        const client = getRedisClient();
        const redisKey = `rl:${key}`;
        try {
            const count = await client.incr(redisKey);
            if (count === 1) {
                await client.expire(redisKey, windowSeconds);
            }
            return count > maxRequests;
        } catch (_) {
            return false;
        }
    }

    /**
     * Leaderboard Anti-Cheat Verification.
     * Prevents unrealistic submissions from registering.
     */
    isSuspiciousSubmission(score, totalQuestions, timeElapsedSeconds) {
        if (totalQuestions <= 0) return true;
        const accuracy = score / totalQuestions;

        // Cheat rule: 100% correct, >5 questions, completed in less than 4 seconds
        if (accuracy === 1.0 && totalQuestions >= 5 && timeElapsedSeconds < 4) {
            return true;
        }
        return false;
    }

    /**
     * Simple bot mitigation heuristics.
     */
    isBot(userAgent) {
        if (!userAgent) return true;
        const bots = ['headlesschrome', 'puppeteer', 'selenium', 'playwright', 'bot', 'spider', 'crawl'];
        const ua = userAgent.toLowerCase();
        return bots.some(b => ua.includes(b));
    }
}

module.exports = new SecurityShieldService();
