'use strict';
/**
 * NirnayPath Achievement Service (Phase 10 — Module A)
 * =====================================================
 * Full achievement + badge evaluation engine.
 * Covers: streak, tests, accuracy, focus, comeback, level milestones.
 * All awards are deduplication-safe via XPService.
 */

const UserXP   = require('../models/UserXP');
const XPService = require('./xpService');

// ── Achievement Catalogue ─────────────────────────────────────────────
const ACHIEVEMENTS = {
    // Streak badges
    streak_3:      { id: 'streak_3',      name: '3-Day Warrior',    icon: '🔥', desc: 'Maintained a 3-day streak',        xp: 50  },
    streak_7:      { id: 'streak_7',      name: 'Week Warrior',     icon: '🔥', desc: 'Maintained a 7-day streak',        xp: 150 },
    streak_14:     { id: 'streak_14',     name: 'Fortnight Fighter', icon: '⚔️', desc: 'Maintained a 14-day streak',      xp: 300 },
    streak_30:     { id: 'streak_30',     name: 'Iron Disciplined', icon: '🛡️', desc: 'Maintained a 30-day streak',       xp: 750 },

    // Test count badges
    test_1:        { id: 'test_1',        name: 'First Step',        icon: '👣', desc: 'Completed your first test',       xp: 50  },
    test_10:       { id: 'test_10',       name: 'Test Veteran',      icon: '📋', desc: 'Completed 10 tests',              xp: 100 },
    test_25:       { id: 'test_25',       name: 'Prolific Learner',  icon: '📚', desc: 'Completed 25 tests',              xp: 150 },
    test_50:       { id: 'test_50',       name: 'Half Century',      icon: '🎯', desc: 'Completed 50 tests',              xp: 250 },
    test_100:      { id: 'test_100',      name: 'Centurion',         icon: '🏆', desc: 'Completed 100 tests',             xp: 500 },

    // Accuracy badges
    perfect_score: { id: 'perfect_score', name: 'Flawless',          icon: '💎', desc: 'Got 100% accuracy in a test',    xp: 200 },
    accuracy_90:   { id: 'accuracy_90',   name: 'Sharpshooter',      icon: '🎯', desc: 'Test accuracy ≥ 90%',            xp: 100 },

    // Level milestones
    level_5:       { id: 'level_5',       name: 'Rising Star',       icon: '⭐', desc: 'Reached Level 5',                xp: 100 },
    level_10:      { id: 'level_10',      name: 'Expert',            icon: '🌟', desc: 'Reached Level 10',               xp: 200 },
    level_20:      { id: 'level_20',      name: 'Master',            icon: '👑', desc: 'Reached Level 20',               xp: 400 },

    // Focus rewards
    focus_master:  { id: 'focus_master',  name: 'Topic Master',      icon: '🎓', desc: 'Improved topic accuracy by 10%+', xp: 120 },

    // Comeback
    comeback:      { id: 'comeback',      name: 'Phoenix',           icon: '🦅', desc: 'Came back after a 3+ day break', xp: 75  },

    // Daily consistency
    daily_7:       { id: 'daily_7',       name: 'Weekly Habit',      icon: '📅', desc: 'Logged in 7 days in a row',      xp: 150 },
};

class AchievementService {

    /**
     * Evaluate and award all applicable achievements after a test submission.
     * @param {ObjectId} userId
     * @param {Object} testResult  — the saved TestResult document
     * @param {number} totalTests  — total tests taken by user (including this one)
     * @param {number} streakCount — current streak after this test
     * @returns {Array} newAchievements unlocked
     */
    static async evaluateAfterTest(userId, testResult, totalTests, streakCount) {
        const record = await XPService.getOrCreate(userId);
        const unlocked = [];

        const existing = new Set(record.achievements.map(a => a.badgeId));

        const candidates = [];

        // ── Test count thresholds ────────────────────────────────────
        if (totalTests === 1)   candidates.push('test_1');
        if (totalTests >= 10)   candidates.push('test_10');
        if (totalTests >= 25)   candidates.push('test_25');
        if (totalTests >= 50)   candidates.push('test_50');
        if (totalTests >= 100)  candidates.push('test_100');

        // ── Accuracy ─────────────────────────────────────────────────
        if (testResult.accuracy === 100) candidates.push('perfect_score');
        if (testResult.accuracy >= 90)   candidates.push('accuracy_90');

        // ── Streak ───────────────────────────────────────────────────
        if (streakCount >= 3)  candidates.push('streak_3');
        if (streakCount >= 7)  candidates.push('streak_7');
        if (streakCount >= 14) candidates.push('streak_14');
        if (streakCount >= 30) candidates.push('streak_30');

        // ── Level milestones ─────────────────────────────────────────
        if (record.level >= 5)  candidates.push('level_5');
        if (record.level >= 10) candidates.push('level_10');
        if (record.level >= 20) candidates.push('level_20');

        // Evaluate only NEW achievements (not already earned)
        for (const id of candidates) {
            if (!existing.has(id) && ACHIEVEMENTS[id]) {
                const def = ACHIEVEMENTS[id];
                record.achievements.push({
                    badgeId:     def.id,
                    badgeName:   def.name,
                    icon:        def.icon,
                    description: def.desc,
                    xpReward:    def.xp,
                    unlockedAt:  new Date()
                });
                existing.add(id);
                unlocked.push(def);

                // Award XP for the achievement itself
                await XPService.award(userId, 'achievement_unlock', { ref: id });
            }
        }

        if (unlocked.length > 0) {
            await record.save();
        }

        return unlocked;
    }

    /**
     * Evaluate comeback achievement after a period of inactivity.
     */
    static async evaluateComeback(userId, gapDays) {
        if (gapDays < 3) return [];
        const record = await XPService.getOrCreate(userId);
        const existing = new Set(record.achievements.map(a => a.badgeId));

        // Comeback is repeatable — key by date month to avoid over-awarding
        const monthKey = `comeback_${new Date().getUTCFullYear()}_${new Date().getUTCMonth()}`;
        if (record.rewardLog.includes(monthKey)) return [];

        const def = ACHIEVEMENTS.comeback;
        record.achievements.push({
            badgeId: def.id, badgeName: def.name, icon: def.icon,
            description: def.desc, xpReward: def.xp, unlockedAt: new Date()
        });
        record.rewardLog.push(monthKey);
        await record.save();

        return [def];
    }

    /**
     * Get all achievements for a user (with locked/unlocked state).
     */
    static async getUserAchievements(userId) {
        const record = await XPService.getOrCreate(userId);
        const earned = new Map(record.achievements.map(a => [a.badgeId, a]));

        return Object.values(ACHIEVEMENTS).map(def => ({
            ...def,
            unlocked:   earned.has(def.id),
            unlockedAt: earned.get(def.id)?.unlockedAt || null,
        }));
    }

    static getCatalogue() {
        return Object.values(ACHIEVEMENTS);
    }
}

module.exports = AchievementService;
module.exports.ACHIEVEMENTS = ACHIEVEMENTS;
