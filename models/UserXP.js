'use strict';
const mongoose = require('mongoose');

/**
 * NirnayPath — UserXP Model (Phase 10)
 * Stores XP totals, levels, achievements, and reward event log.
 * Duplicate prevention is enforced at both service and DB layer.
 */

const AchievementSchema = new mongoose.Schema({
    badgeId:     { type: String, required: true },
    badgeName:   { type: String, required: true },
    icon:        { type: String, default: '🏅' },
    description: { type: String, default: '' },
    xpReward:    { type: Number, default: 0 },
    unlockedAt:  { type: Date,   default: Date.now }
}, { _id: false });

const XPEventSchema = new mongoose.Schema({
    action:      { type: String, required: true },  // e.g. 'test_complete', 'daily_login', 'streak_7'
    xp:          { type: Number, required: true },
    metadata:    { type: Object, default: {} },
    createdAt:   { type: Date,   default: Date.now }
}, { _id: false });

const UserXPSchema = new mongoose.Schema({
    userId: {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'User',
        required: true,
        unique:   true,
        index:    true
    },

    // ── XP & Level ──────────────────────────────────────────────
    totalXP:     { type: Number, default: 0, min: 0 },
    level:       { type: Number, default: 1, min: 1 },
    xpToNextLevel: { type: Number, default: 500 },

    // ── Streak Tracking ──────────────────────────────────────────
    currentStreak:   { type: Number, default: 0 },
    longestStreak:   { type: Number, default: 0 },
    lastStreakDate:   { type: Date,   default: null },

    // ── Reward Deduplication ─────────────────────────────────────
    // Stores action keys already rewarded per day (e.g. 'daily_login_2024-05-20')
    rewardLog: {
        type:    [String],
        default: []
    },

    // ── Achievements ─────────────────────────────────────────────
    achievements: [AchievementSchema],

    // ── XP Event History (last 200 events) ───────────────────────
    xpHistory: {
        type:    [XPEventSchema],
        default: []
    },

    // ── Leaderboard Snapshot ──────────────────────────────────────────────
    weeklyXP:    { type: Number, default: 0 },  // reset every Monday
    weeklyReset: { type: Date,   default: null },

    // ── Rank History (BUG-007 fix) ────────────────────────────────────────
    // Stores the user's rank from the last leaderboard snapshot.
    // Updated non-blocking via bulkWrite after each leaderboard computation.
    // Used to compute rankMovement (previousRank - currentRank) on next render.
    previousRank: { type: Number, default: 0 },

    updatedAt:   { type: Date, default: Date.now }
}, { timestamps: true });

// ── Indexes ────────────────────────────────────────────────────────────
UserXPSchema.index({ totalXP: -1 });           // Global leaderboard sort
UserXPSchema.index({ weeklyXP: -1 });          // Weekly leaderboard sort
UserXPSchema.index({ level: -1 });             // Level ranking
UserXPSchema.index({ currentStreak: -1 });     // Streak board

// ── Level Thresholds (static helper) ─────────────────────────────────
UserXPSchema.statics.getLevelThreshold = function(level) {
    // Exponential curve: each level costs 20% more XP than previous
    // Level 1→2: 500 XP, Level 2→3: 600 XP, etc.
    return Math.floor(500 * Math.pow(1.2, level - 1));
};

UserXPSchema.statics.computeLevel = function(totalXP) {
    let level = 1;
    let accumulated = 0;
    while (true) {
        const threshold = Math.floor(500 * Math.pow(1.2, level - 1));
        if (accumulated + threshold > totalXP) break;
        accumulated += threshold;
        level++;
        if (level > 100) break; // cap at 100
    }
    return level;
};

const UserXP = mongoose.model('UserXP', UserXPSchema);
module.exports = UserXP;
