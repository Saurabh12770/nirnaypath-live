const cron = require('node-cron');
const User = require('../models/user');
const UserXP = require('../models/UserXP');
const notificationService = require('./notificationService');
const recommendationService = require('../server/services/recommendationService');
const { generateWeeklyDigest } = require('./emailDigest');

// autorun scheduled tasks configs
const EXAMS_CONFIG = {
    'bpsc': { name: 'BPSC 71st Prelims', date: new Date('2026-10-15T00:00:00Z') },
    'upsc': { name: 'UPSC Civil Services', date: new Date('2026-06-20T00:00:00Z') }
};

const initCronJobs = () => {
    console.log('Initializing scheduled retention engines...');

    // 1. Daily Streak/Comeback Reminder (Every day at 8 PM)
    cron.schedule('0 20 * * *', async () => {
        console.log('Running daily streak/comeback reminder cron...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            // Find active users with streaks in danger
            const users = await User.find({ isActive: true }).select('_id lastActiveDate streakCount').lean();

            for (const user of users) {
                const xpRecord = await UserXP.findOne({ userId: user._id });
                const streak = xpRecord?.currentStreak || user.streakCount || 0;

                if (streak > 0 && user.lastActiveDate) {
                    const lastActive = new Date(user.lastActiveDate);
                    const diffDays = Math.floor((today - lastActive) / 86400000);

                    if (diffDays === 1) {
                        // Streak in danger
                        await notificationService.sendStreakAlert(user._id, streak);
                    } else if (diffDays > 1) {
                        // Streak already broken, reset streak count & suggest comeback
                        if (xpRecord) {
                            xpRecord.currentStreak = 0;
                            await xpRecord.save();
                        }
                        await User.updateOne({ _id: user._id }, { $set: { streakCount: 0 } });
                    }
                }
            }
        } catch (error) {
            console.error('Streak reminder cron error:', error);
        }
    });

    // 2. Daily Study Reminder (Every day at 9 AM)
    cron.schedule('0 9 * * *', async () => {
        console.log('Running daily study reminder cron...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            // Suggest study to users inactive today
            const inactiveUsers = await User.find({
                isActive: true,
                $or: [
                    { lastActiveDate: { $lt: today } },
                    { lastActiveDate: null }
                ]
            }).select('_id name').lean();

            for (const user of inactiveUsers) {
                const msgs = [
                    `Hi ${user.name}, consistency is key to cracking your dream exam. Take a 5-minute drill now!`,
                    `Practice makes perfect! Challenge yourself with a subject mock test today.`,
                    `Don't break the habit! Spend a few minutes reviewing your weak topics today.`
                ];
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                await notificationService.sendStudyReminder(user._id, msg);
            }
        } catch (error) {
            console.error('Study reminder cron error:', error);
        }
    });

    // 3. Daily Exam Countdown Notification (Every day at 10 AM)
    cron.schedule('0 10 * * *', async () => {
        console.log('Running daily exam countdown cron...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            const users = await User.find({ isActive: true }).select('_id').lean();
            const TestResult = require('../models/testResult');
            const LiveResult = require('../models/liveResult');
            const LiveSession = require('../models/liveSession');

            for (const examKey in EXAMS_CONFIG) {
                const exam = EXAMS_CONFIG[examKey];
                const diffTime = exam.date - today;
                const diffDays = Math.ceil(diffTime / 86400000);

                // Only alert at milestones: 100, 50, 30, 15, 7, 3, 2, 1 days out
                const milestones = [100, 50, 30, 15, 7, 3, 2, 1];
                if (diffDays > 0 && milestones.includes(diffDays)) {
                    const liveSessions = await LiveSession.find({ exam: new RegExp(`^${examKey}$`, 'i') }).select('_id').lean();
                    const liveSessionIds = liveSessions.map(s => s._id);

                    for (const user of users) {
                        // Check if user has taken a test for this exam
                        const hasTakenTest = await TestResult.exists({ 
                            userId: user._id, 
                            exam: new RegExp(`^${examKey}$`, 'i') 
                        });

                        // Check if user has registered/participated in a live session of this exam
                        let hasRegisteredLive = false;
                        if (liveSessionIds.length > 0) {
                            hasRegisteredLive = await LiveResult.exists({
                                userId: user._id,
                                liveSessionId: { $in: liveSessionIds }
                            });
                        }

                        // Fallback: If user has 0 test results at all, send countdowns for both as a default discovery path
                        const totalTestsCount = await TestResult.countDocuments({ userId: user._id });

                        if (hasTakenTest || hasRegisteredLive || totalTestsCount === 0) {
                            await notificationService.sendExamCountdown(user._id, exam.name, diffDays);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Exam countdown cron error:', error);
        }
    });

    // 4. Periodic Personalized Recommendations (Every Monday & Thursday at 11 AM)
    cron.schedule('0 11 * * 1,4', async () => {
        console.log('Running periodic AI recommendation delivery cron...');
        try {
            const users = await User.find({ isActive: true }).select('_id').lean();

            for (const user of users) {
                // Generate and cache recommendations
                const recs = await recommendationService.generate(user._id);
                
                // If there are specific weakness correction recommendations, alert the user
                const correction = recs.recommendations.find(r => r.type === 'WEAKNESS_CORRECTION');
                if (correction) {
                    await notificationService.sendRecommendation(user._id, correction);
                }
            }
        } catch (error) {
            console.error('Recommendation delivery cron error:', error);
        }
    });

    // 5. Weekly Email Digest (Every Sunday at 9 AM)
    cron.schedule('0 9 * * 0', async () => {
        console.log('Running weekly email digest cron...');
        await generateWeeklyDigest();
    });
};

module.exports = { initCronJobs };
