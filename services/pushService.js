const webPush = require('web-push');
const User = require('../models/user');

let isConfigured = false;

try {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webPush.setVapidDetails(
            process.env.VAPID_EMAIL || 'mailto:support@nirnaypath.com',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
        isConfigured = true;
        console.log('Push notifications configured.');
    } else {
        console.log('Push notifications disabled: missing VAPID keys.');
    }
} catch (err) {
    console.warn('Push notifications not configured:', err.message);
}

/**
 * Sends a push notification to a specific user.
 * Gracefully handles cases where push is not configured.
 */
async function sendPushNotification(userId, payload) {
    if (!isConfigured) {
        console.log(`Push skipped for user ${userId}: Service not configured.`);
        return { success: false, error: 'Push service not configured' };
    }

    try {
        const user = await User.findById(userId);
        if (!user || !user.pushSubscription) {
            return { success: false, error: 'User not subscribed to push notifications' };
        }

        const notificationPayload = JSON.stringify(payload);
        await webPush.sendNotification(user.pushSubscription, notificationPayload);
        
        console.log(`Push notification sent to user ${userId}`);
        return { success: true };
    } catch (error) {
        console.error(`Error sending push to user ${userId}:`, error);
        // If subscription is expired or invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
            await User.findByIdAndUpdate(userId, { pushSubscription: null });
            console.log(`Removed invalid push subscription for user ${userId}`);
        }
        return { success: false, error: error.message };
    }
}

module.exports = { 
    sendPush: sendPushNotification, 
    sendPushNotification 
};
