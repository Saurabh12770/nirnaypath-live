const { Worker } = require('bullmq');
const { getConnection } = require('../services/queueService');
const { isRedisAvailable } = require('../services/redisService');
const { addEmailJob } = require('../services/queueService');
const User = require('../models/user');
const TestResult = require('../models/testResult');

const createDigestWorker = () => {
    const connection = getConnection();
    if (!connection || !isRedisAvailable()) {
        console.warn('[WORKER][Digest] Redis not available. Digest worker not started.');
        return null;
    }

    const worker = new Worker('digest-queue', async (job) => {
        console.log(`[WORKER][Digest] Processing job: ${job.id}`);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const cursor = User.find({ email: { $exists: true } }).cursor();

        for (let user = await cursor.next(); user != null; user = await cursor.next()) {
            try {
                const results = await TestResult.find({
                    userId: user._id,
                    createdAt: { $gte: sevenDaysAgo },
                }).lean();

                if (results.length === 0) continue;

                const totalTests = results.length;
                const avgAccuracy = (results.reduce((acc, r) => acc + (r.accuracy || 0), 0) / totalTests).toFixed(1);

                const subjectStats = {};
                results.forEach(r => {
                    if (!subjectStats[r.subject]) subjectStats[r.subject] = { score: 0, count: 0 };
                    subjectStats[r.subject].score += (r.accuracy || 0);
                    subjectStats[r.subject].count += 1;
                });

                let bestSubject = 'N/A', worstSubject = 'N/A';
                let maxAcc = -1, minAcc = 101;
                for (const sub in subjectStats) {
                    const acc = subjectStats[sub].score / subjectStats[sub].count;
                    if (acc > maxAcc) { maxAcc = acc; bestSubject = sub; }
                    if (acc < minAcc) { minAcc = acc; worstSubject = sub; }
                }

                const html = `
                    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:30px;border:1px solid #e0e0e0;border-radius:15px;color:#333">
                        <h1 style="color:#1B3A6B;text-align:center">Weekly Progress Digest</h1>
                        <p style="text-align:center;color:#666">Keep climbing, ${user.name || 'Aspirant'}!</p>
                        <div style="background:linear-gradient(135deg,#1B3A6B,#3498db);padding:25px;border-radius:12px;color:white;text-align:center;margin:20px 0">
                            <strong style="font-size:2em">${totalTests}</strong> Tests &nbsp;|&nbsp;
                            <strong style="font-size:2em">${avgAccuracy}%</strong> Accuracy &nbsp;|&nbsp;
                            <strong style="font-size:2em">${user.streakCount || 0} 🔥</strong> Streak
                        </div>
                        <p>🚀 Strongest: <strong>${bestSubject}</strong></p>
                        <p>⚠️ Needs Focus: <strong>${worstSubject}</strong></p>
                        <div style="text-align:center;margin-top:20px">
                            <a href="https://nirnaypath.com/dashboard" style="background:#1B3A6B;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold">Resume Learning</a>
                        </div>
                    </div>`;

                await addEmailJob('weekly-digest', {
                    to: user.email,
                    subject: 'Your Weekly NirnayPath Progress Report 📈',
                    html,
                });
            } catch (err) {
                console.error(`[WORKER][Digest] Failed for user ${user._id}:`, err.message);
            }
        }
    }, { connection, concurrency: 1 });

    worker.on('completed', (job) => console.log(`[WORKER][Digest] Job ${job.id} completed.`));
    worker.on('failed', (job, err) => console.error(`[WORKER][Digest] Job ${job?.id} failed:`, err.message));
    worker.on('error', (err) => console.error('[WORKER][Digest] Worker error (non-fatal):', err.message));

    return worker;
};

module.exports = { createDigestWorker };
