const socketService = require('./socketService');
const webpush = require('web-push');
const User = require('../models/User');

/**
 * NirnayPath Enterprise Notification Engine
 * Orchestrates multi-channel delivery (Socket, Push, In-App)
 */
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
            console.log('[Notification] WebPush VAPID details configured.');
        }
    }

    /**
     * Send real-time notification to user
     * @param {string} userId 
     * @param {object} notification { title, message, type, action }
     */
    async send(userId, notification) {
        console.log(`[Notification] Sending to User ${userId}: ${notification.title}`);

        // 1. Real-time Delivery (Socket)
        socketService.emitToUser(userId, 'notification', {
            ...notification,
            timestamp: new Date()
        });

        // 2. Persistent Push Delivery (WebPush)
        try {
            const user = await User.findById(userId).select('pushSubscription');
            if (user && user.pushSubscription) {
                await webpush.sendNotification(
                    user.pushSubscription,
                    JSON.stringify({
                        title: notification.title,
                        body: notification.message,
                        icon: '/assets/logo-192.png',
                        data: { url: notification.action || '/dashboard' }
                    })
                ).catch(err => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        console.warn(`[Notification] Push subscription expired for user ${userId}`);
                        // Clean up expired subscription
                        User.updateOne({ _id: userId }, { $set: { pushSubscription: null } }).exec();
                    }
                });
            }
        } catch (err) {
            console.error('[Notification] Push delivery failed:', err.message);
        }
    }

    /**
     * Specialized: Anti-Cheat Warning
     */
    async sendCheatWarning(userId, type) {
        const warnings = {
            'tab_switch': 'Tab switching detected! Continuing will invalidate your test session.',
            'multi_device': 'Multiple devices detected. Please use a single device for competitive exams.',
            'anomaly': 'Suspicious behavior detected. Your performance is under review.'
        };

        await this.send(userId, {
            title: '⚠️ Security Alert',
            message: warnings[type] || 'Integrity alert triggered.',
            type: 'warning',
            priority: 'high'
        });
    }

    /**
     * Specialized: Achievement Unlock
     */
    async sendAchievement(userId, badgeName) {
        await this.send(userId, {
            title: '🏆 Achievement Unlocked!',
            message: `Congratulations! You've earned the ${badgeName} badge.`,
            type: 'success',
            action: '/dashboard'
        });
    }
}

module.exports = new NotificationService();
