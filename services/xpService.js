'use strict';
/**
 * NirnayPath XP Service (Phase 10 — Module A)
 * ============================================
 * Central engine for all XP operations.
 * - Awards XP from real actions only
 * - Prevents duplicate rewards using keyed deduplication
 * - Persists all changes atomically
 * - Calculates level progression with exponential curve
 */

const UserXP = require('../models/UserXP');
const CacheLayer = require('./cacheLayer');

// ── XP Action Table ────────────────────────────────────────────────────
const XP_ACTIONS = {
    // Test-based (per test submit)
    test_complete:        { xp: 50,  daily: false, desc: 'Completed a test' },
    test_perfect:         { xp: 200, daily: false, desc: 'Perfect accuracy (100%)' },
    test_above_80:        { xp: 100, daily: false, desc: 'Test accuracy ≥ 80%' },
    test_above_60:        { xp: 50,  daily: false, desc: 'Test accuracy ≥ 60%' },
    drill_complete:       { xp: 30,  daily: false, desc: 'Completed a drill' },
    section_complete:     { xp: 40,  daily: false, desc: 'Completed a section test' },

    // Daily rewards (one per calendar day)
    daily_login:          { xp: 20,  daily: true,  desc: 'Daily login bonus' },
    daily_first_test:     { xp: 30,  daily: true,  desc: 'First test of the day' },

    // Streak rewards
    streak_3:             { xp: 50,  daily: false, desc: '3-day streak' },
    streak_7:             { xp: 150, daily: false, desc: '7-day streak' },
    streak_14:            { xp: 300, daily: false, desc: '14-day streak' },
    streak_30:            { xp: 750, daily: false, desc: '30-day streak' },

    // Comeback rewards
    comeback_3:           { xp: 75,  daily: false, desc: 'Back after 3-day break' },
    comeback_7:           { xp: 150, daily: false, desc: 'Back after 7-day break' },

    // Focus rewards (topic mastery)
    focus_topic_5tests:   { xp: 80,  daily: false, desc: '5 tests in same topic' },
    focus_topic_improve:  { xp: 120, daily: false, desc: 'Topic accuracy improved ≥ 10%' },

    // Achievement unlock bonus
    achievement_unlock:   { xp: 50,  daily: false, desc: 'Achievement badge unlocked' },

    // Referral milestone rewards
    referral_1:           { xp: 100,  daily: false, desc: 'Referred 1 user' },
    referral_5:           { xp: 500,  daily: false, desc: 'Referred 5 users' },
    referral_10:          { xp: 1000, daily: false, desc: 'Referred 10 users' },
    referral_25:          { xp: 2500, daily: false, desc: 'Referred 25 users' },
    referral_50:          { xp: 5000, daily: false, desc: 'Referred 50 users' },
};

// ── Utility: today's date key ──────────────────────────────────────────
function todayKey() {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}

class XPService {

    /**
     * Get or create the XP record for a user.
     */
    static async getOrCreate(userId) {
        let record = await UserXP.findOne({ userId });
        if (!record) {
            record = await UserXP.create({ userId });
        }
        return record;
    }

    /**
     * Award XP to a user for a specific action.
     * Returns { awarded, xp, newLevel, levelUp, totalXP, duplicateBlocked }
     */
    static async award(userId, action, metadata = {}) {
        const config = XP_ACTIONS[action];
        if (!config) {
            console.warn(`[XPService] Unknown action: ${action}`);
            return { awarded: false, reason: 'unknown_action' };
        }

        const record = await this.getOrCreate(userId);

        // ── Duplicate Prevention ───────────────────────────────────────
        const rewardKey = config.daily
            ? `${action}_${todayKey()}`   // daily: once per calendar day
            : `${action}_${metadata.sessionId || metadata.ref || ''}`;  // event: once per session/ref

        // For non-daily, non-session actions allow multiple (e.g. streak rewards keyed by streak count)
        if (metadata.streakCount !== undefined) {
            const specialKey = `${action}_streak${metadata.streakCount}`;
            if (record.rewardLog.includes(specialKey)) {
                return { awarded: false, duplicateBlocked: true, reason: 'already_rewarded' };
            }
            record.rewardLog.push(specialKey);
        } else if (rewardKey && record.rewardLog.includes(rewardKey)) {
            return { awarded: false, duplicateBlocked: true, reason: 'already_rewarded' };
        } else if (rewardKey) {
            record.rewardLog.push(rewardKey);
        }

        // Trim reward log to last 1000 entries
        if (record.rewardLog.length > 1000) {
            record.rewardLog = record.rewardLog.slice(-1000);
        }

        // ── Apply XP ───────────────────────────────────────────────────
        const oldLevel = record.level;
        record.totalXP += config.xp;
        record.weeklyXP += config.xp;

        // Recalculate level
        const newLevel = UserXP.computeLevel(record.totalXP);
        record.level = newLevel;
        record.xpToNextLevel = UserXP.getLevelThreshold(newLevel) -
            (record.totalXP - this._xpForLevel(newLevel));

        // ── Add to history (last 200) ──────────────────────────────────
        record.xpHistory.push({ action, xp: config.xp, metadata });
        if (record.xpHistory.length > 200) {
            record.xpHistory = record.xpHistory.slice(-200);
        }

        record.updatedAt = new Date();
        await record.save();

        // Invalidate cached XP for this user
        CacheLayer.invalidate(`xp_${userId}`);
        CacheLayer.invalidate('leaderboard_global');
        CacheLayer.invalidate('leaderboard_weekly');

        return {
            awarded:  true,
            action,
            xp:       config.xp,
            totalXP:  record.totalXP,
            level:    newLevel,
            levelUp:  newLevel > oldLevel,
            oldLevel,
            xpToNextLevel: record.xpToNextLevel,
            desc:     config.desc
        };
    }

    /**
     * Compute XP accumulated up to (but not including) a given level.
     */
    static _xpForLevel(level) {
        let total = 0;
        for (let l = 1; l < level; l++) {
            total += Math.floor(500 * Math.pow(1.2, l - 1));
        }
        return total;
    }

    /**
     * Award XP for completing a test — evaluates accuracy bonuses too.
     * Called from routes/test.js submit handler.
     */
    static async awardForTestSubmit(userId, testResult) {
        const results = [];
        const { accuracy, mode, sessionId, subject } = testResult;
        const ref = sessionId;

        // 1. Base completion reward
        const baseAction = mode === 'drill' ? 'drill_complete'
            : mode === 'section' ? 'section_complete'
            : 'test_complete';
        results.push(await this.award(userId, baseAction, { ref }));

        // 2. Accuracy bonus
        if (accuracy === 100) {
            results.push(await this.award(userId, 'test_perfect', { ref }));
        } else if (accuracy >= 80) {
            results.push(await this.award(userId, 'test_above_80', { ref }));
        } else if (accuracy >= 60) {
            results.push(await this.award(userId, 'test_above_60', { ref }));
        }

        // 3. Daily first-test bonus
        results.push(await this.award(userId, 'daily_first_test', { ref }));

        // Return all non-null awards
        return results.filter(r => r.awarded);
    }

    /**
     * Award streak XP. Called after streak update.
     */
    static async awardForStreak(userId, streakCount) {
        const milestones = [3, 7, 14, 30];
        const results = [];
        for (const m of milestones) {
            if (streakCount === m) {
                results.push(await this.award(userId, `streak_${m}`, { streakCount }));
            }
        }
        return results.filter(r => r.awarded);
    }

    /**
     * Award comeback XP after a break.
     * gapDays = days since last activity.
     */
    static async awardForComeback(userId, gapDays) {
        const results = [];
        if (gapDays >= 7) results.push(await this.award(userId, 'comeback_7', {}));
        else if (gapDays >= 3) results.push(await this.award(userId, 'comeback_3', {}));
        return results.filter(r => r.awarded);
    }

    /**
     * Award daily login XP.
     */
    static async awardDailyLogin(userId) {
        return this.award(userId, 'daily_login', {});
    }

    /**
     * Get summary for a user (cached).
     */
    static async getSummary(userId) {
        const cacheKey = `xp_${userId}`;
        const cached = CacheLayer.getSnapshot(cacheKey);
        if (cached) return cached;

        const record = await this.getOrCreate(userId);
        const summary = {
            totalXP:       record.totalXP,
            level:         record.level,
            xpToNextLevel: record.xpToNextLevel,
            weeklyXP:      record.weeklyXP,
            currentStreak: record.currentStreak,
            longestStreak: record.longestStreak,
            achievements:  record.achievements,
            recentXP:      record.xpHistory.slice(-10).reverse()
        };

        CacheLayer.setSnapshot(cacheKey, summary, 60); // 60s cache
        return summary;
    }
}

module.exports = XPService;
