const cron = require('node-cron');
const User = require('../models/user');
const { sendPushNotification } = require('./pushService');
const { generateWeeklyDigest } = require('./emailDigest');

const initCronJobs = () => {
    console.log('Initializing scheduled tasks...');

    // 1. Daily Streak Reminder (Every day at 8 PM)
    cron.schedule('0 20 * * *', async () => {
        console.log('Running daily streak reminder cron...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            // Find users who haven't been active today but have an active streak
            const users = await User.find({
                pushSubscription: { $exists: true, $ne: null },
                streakCount: { $gt: 0 },
                $or: [
                    { lastActiveDate: { $lt: today } },
                    { lastActiveDate: null }
                ]
            });

            for (const user of users) {
                await sendPushNotification(user._id, {
                    title: '🔥 Streak in Danger!',
                    body: `Your ${user.streakCount}-day streak is about to expire! Take a quick test now to keep it alive.`,
                    icon: '/images/logo-icon.png',
                    data: { url: '/dashboard' }
                });
            }
        } catch (error) {
            console.error('Streak reminder cron error:', error);
        }
    });

    // 2. Weekly Email Digest (Every Sunday at 9 AM)
    cron.schedule('0 9 * * 0', async () => {
        console.log('Running weekly email digest cron...');
        await generateWeeklyDigest();
    });

    // 3. New Content Announcement (Monthly)
    cron.schedule('0 10 1 * *', async () => {
        console.log('Running monthly content announcement...');
        try {
            const users = await User.find({ pushSubscription: { $exists: true, $ne: null } });
            for (const user of users) {
                try {
                    await sendPushNotification(user._id, {
                        title: '📚 New Test Series!',
                        body: 'We have added fresh BPSC 71st Prelims mock tests. Check them out!',
                        icon: '/images/logo-icon.png',
                        data: { url: '/#popular-exams' }
                    });
                } catch (pushErr) {
                    console.error(`[Cron] Push notification failed for user ${user._id}:`, pushErr.message);
                }
            }
        } catch (error) {
            console.error('Monthly content announcement cron error:', error);
        }
    });
};

module.exports = { initCronJobs };
