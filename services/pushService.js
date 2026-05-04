const webpush = require('web-push');
const User = require('../models/User');

const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@nirnaypath.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const sendPushNotification = async (userId, payload) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.pushSubscription) {
            return { success: false, error: 'User not subscribed to push notifications' };
        }

        const notificationPayload = JSON.stringify(payload);
        await webpush.sendNotification(user.pushSubscription, notificationPayload);
        
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
};

module.exports = { sendPushNotification };
