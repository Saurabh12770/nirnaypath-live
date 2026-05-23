'use strict';
/**
 * NirnayPath — Enhanced Notification Service (Phase 10 — Module D)
 * =================================================================
 * Multi-channel delivery: Socket.IO (real-time) + WebPush + Persistent DB
 * Supports: study reminders, streak alerts, achievements, exam countdown, recommendations
 */

const socketService   = require('./socketService');
const webpush         = require('web-push');
const User            = require('../models/user');
const Notification    = require('../models/Notification');

class NotificationService {
    constructor() {
        this.setupWebPush();
    }

    setupWebPush() {
        if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            webpush.setVapidDetails(
                process.env.VAPID_EMAIL || 'mailto:admin@nirnaypath.com',
                process.env.VAPID_PUBLIC_KEY,
                process.env.VAPID_PRIVATE_KEY
            );
        }
    }

    /**
     * Core send method — persists to DB + delivers real-time + push
     * @param {string|ObjectId} userId
     * @param {Object} payload { title, message, type, icon, action, priority, metadata, expiresAt }
     */
    async send(userId, payload) {
        const {
            title, message,
            type     = 'system',
            icon     = '🔔',
            action   = '/dashboard',
            priority = 'normal',
            metadata = {},
            expiresAt = null
        } = payload;

        try {
            // 1. Persist to MongoDB
            const notification = await Notification.create({
                userId, title, message, type, icon, action, priority, metadata, expiresAt
            });

            // 2. Real-time delivery via Socket.IO
            socketService.emitToUser(String(userId), 'notification', {
                id:        notification._id,
                title, message, type, icon, action, priority,
                timestamp: notification.createdAt
            });

            // 3. WebPush (best-effort, non-blocking)
            this._sendPush(userId, { title, message, action }).catch(() => {});

            return notification;
        } catch (err) {
            console.error('[NotificationService] send() error:', err.message);
            return null;
        }
    }

    async _sendPush(userId, { title, message, action }) {
        try {
            const user = await User.findById(userId).select('pushSubscription').lean();
            if (!user?.pushSubscription) return;
            await webpush.sendNotification(
                user.pushSubscription,
                JSON.stringify({
                    title,
                    body:  message,
                    icon:  '/assets/logo-192.png',
                    data:  { url: action || '/dashboard' }
                })
            );
        } catch (err) {
            if (err.statusCode === 403 || err.statusCode === 410 || err.statusCode === 404) {
                await User.updateOne({ _id: userId }, { $set: { pushSubscription: null } });
            }
        }
    }

    // ── Specialized Senders ──────────────────────────────────────────────

    async sendAchievement(userId, achievement) {
        return this.send(userId, {
            title:    `🏆 Achievement Unlocked: ${achievement.name}!`,
            message:  `${achievement.icon} ${achievement.desc} — You earned ${achievement.xp} XP!`,
            type:     'achievement',
            icon:     achievement.icon || '🏆',
            action:   '/dashboard#achievements',
            priority: 'high',
            metadata: { achievementId: achievement.id }
        });
    }

    async sendStreakAlert(userId, streakCount) {
        return this.send(userId, {
            title:    '🔥 Streak in Danger!',
            message:  `Your ${streakCount}-day streak is about to expire. Take a test now to keep it alive!`,
            type:     'streak',
            icon:     '🔥',
            action:   '/dashboard',
            priority: 'high',
            metadata: { streakCount }
        });
    }

    async sendStreakMilestone(userId, streakCount) {
        return this.send(userId, {
            title:    `🔥 ${streakCount}-Day Streak!`,
            message:  `Amazing! You've maintained a ${streakCount}-day learning streak. Keep it up!`,
            type:     'streak',
            icon:     '🔥',
            action:   '/dashboard',
            priority: 'normal',
            metadata: { streakCount }
        });
    }

    async sendStudyReminder(userId, message) {
        return this.send(userId, {
            title:   '📚 Time to Study!',
            message: message || 'You haven\'t practiced today. A quick test keeps your skills sharp!',
            type:    'reminder',
            icon:    '📚',
            action:  '/dashboard',
            priority: 'normal'
        });
    }

    async sendExamCountdown(userId, examName, daysLeft) {
        const urgency = daysLeft <= 7 ? 'high' : daysLeft <= 30 ? 'normal' : 'low';
        return this.send(userId, {
            title:    `⏰ ${examName} in ${daysLeft} Days`,
            message:  `Your exam is approaching! ${daysLeft <= 7 ? '🚨 Final sprint time!' : 'Stay consistent with daily practice.'}`,
            type:     'exam_countdown',
            icon:     '⏰',
            action:   '/dashboard',
            priority: urgency,
            metadata: { examName, daysLeft }
        });
    }

    async sendRecommendation(userId, rec) {
        return this.send(userId, {
            title:    `💡 ${rec.title}`,
            message:  rec.message,
            type:     'recommendation',
            icon:     '💡',
            action:   rec.action || '/dashboard',
            priority: 'normal',
            metadata: rec
        });
    }

    async sendXPReward(userId, xpAmount, reason) {
        return this.send(userId, {
            title:   `⚡ +${xpAmount} XP Earned!`,
            message: reason || 'Great work! You earned XP for your activity.',
            type:    'xp_reward',
            icon:    '⚡',
            action:  '/dashboard#xp',
            priority: 'low',
            metadata: { xp: xpAmount }
        });
    }

    async sendLevelUp(userId, newLevel) {
        return this.send(userId, {
            title:    `🎉 Level Up! You're now Level ${newLevel}!`,
            message:  `Congratulations! You've reached Level ${newLevel}. Keep pushing your limits!`,
            type:     'xp_reward',
            icon:     '🎉',
            action:   '/dashboard#xp',
            priority: 'high',
            metadata: { newLevel }
        });
    }

    async sendCheatWarning(userId, type) {
        const warnings = {
            'tab_switch':   'Tab switching detected! Continuing will invalidate your test session.',
            'multi_device': 'Multiple devices detected. Please use a single device.',
            'anomaly':      'Suspicious behavior detected. Your performance is under review.'
        };
        return this.send(userId, {
            title:    '⚠️ Security Alert',
            message:  warnings[type] || 'Integrity alert triggered.',
            type:     'system',
            icon:     '⚠️',
            action:   '/dashboard',
            priority: 'high'
        });
    }

    async sendLeaderboardRankChange(userId, newRank, oldRank) {
        const improved = newRank < oldRank;
        return this.send(userId, {
            title:    improved ? `📈 You climbed to Rank #${newRank}!` : `📉 Your rank dropped to #${newRank}`,
            message:  improved
                ? `You moved up ${oldRank - newRank} spots on the leaderboard. Keep it up!`
                : `You dropped ${newRank - oldRank} spots. Take more tests to reclaim your rank!`,
            type:     'leaderboard',
            icon:     improved ? '📈' : '📉',
            action:   '/dashboard#leaderboard',
            priority: 'normal',
            metadata: { newRank, oldRank }
        });
    }

    // ── Query Methods ──────────────────────────────────────────────────

    async getUnread(userId, limit = 20) {
        return Notification.find({ userId, isRead: false })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }

    async getAll(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            Notification.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Notification.countDocuments({ userId })
        ]);
        return { notifications, total, page, totalPages: Math.ceil(total / limit) };
    }

    async markRead(userId, notificationId) {
        return Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { $set: { isRead: true } },
            { new: true }
        );
    }

    async markAllRead(userId) {
        return Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    }

    async getUnreadCount(userId) {
        return Notification.countDocuments({ userId, isRead: false });
    }
}

module.exports = new NotificationService();
