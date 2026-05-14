const { Worker } = require('bullmq');
const { connection, addEmailJob } = require('../services/queueService');
const User = require('../models/user');
const TestResult = require('../models/testResult');

const createDigestWorker = () => {
    const worker = new Worker('digest-queue', async (job) => {
        console.log(`[Worker] Processing weekly digest job: ${job.id}`);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Cursor-based streaming for users to handle millions without memory issues
        const cursor = User.find({ email: { $exists: true } }).cursor();
        
        for (let user = await cursor.next(); user != null; user = await cursor.next()) {
            try {
                const results = await TestResult.find({
                    userId: user._id,
                    createdAt: { $gte: sevenDaysAgo }
                }).lean();

                if (results.length === 0) continue;

                // Stats calculation (keeping original logic)
                const totalTests = results.length;
                const avgAccuracy = (results.reduce((acc, r) => acc + r.accuracy, 0) / totalTests).toFixed(1);
                
                const subjectStats = {};
                results.forEach(r => {
                    if (!subjectStats[r.subject]) subjectStats[r.subject] = { score: 0, count: 0 };
                    subjectStats[r.subject].score += r.accuracy;
                    subjectStats[r.subject].count += 1;
                });

                let bestSubject = 'N/A', worstSubject = 'N/A';
                let maxAcc = -1, minAcc = 101;

                for (const sub in subjectStats) {
                    const acc = subjectStats[sub].score / subjectStats[sub].count;
                    if (acc > maxAcc) { maxAcc = acc; bestSubject = sub; }
                    if (acc < minAcc) { minAcc = acc; worstSubject = sub; }
                }

                const modeStats = { full: 0, drill: 0, section: 0 };
                results.forEach(r => { if (modeStats[r.mode] !== undefined) modeStats[r.mode]++; });

                const html = `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 15px; color: #333;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #1B3A6B; margin-bottom: 5px;">Weekly Progress Digest</h1>
                            <p style="color: #666; font-size: 1.1em;">Keep climbing toward your goal, ${user.name}!</p>
                        </div>

                        <div style="background: linear-gradient(135deg, #1B3A6B 0%, #3498db 100%); padding: 25px; border-radius: 12px; color: white; margin-bottom: 30px; text-align: center;">
                            <div style="display: flex; justify-content: space-around;">
                                <div style="flex: 1;">
                                    <div style="font-size: 2em; font-weight: bold;">${totalTests}</div>
                                    <div style="font-size: 0.9em; opacity: 0.9;">Tests Taken</div>
                                </div>
                                <div style="flex: 1; border-left: 1px solid rgba(255,255,255,0.2); border-right: 1px solid rgba(255,255,255,0.2);">
                                    <div style="font-size: 2em; font-weight: bold;">${avgAccuracy}%</div>
                                    <div style="font-size: 0.9em; opacity: 0.9;">Avg Accuracy</div>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-size: 2em; font-weight: bold;">${user.streakCount} 🔥</div>
                                    <div style="font-size: 0.9em; opacity: 0.9;">Current Streak</div>
                                </div>
                            </div>
                        </div>

                        <div style="margin-bottom: 30px;">
                            <h3 style="color: #1B3A6B; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Subject Analysis</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;"><strong>🚀 Strongest:</strong></td>
                                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #27ae60; font-weight: bold;">${bestSubject}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;"><strong>⚠️ Needs Focus:</strong></td>
                                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #e74c3c; font-weight: bold;">${worstSubject}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="text-align: center;">
                            <a href="http://nirnaypath.com/dashboard" style="display: inline-block; background-color: #1B3A6B; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Resume Learning</a>
                        </div>
                    </div>
                `;

                // Offload actual email sending to the email worker
                await addEmailJob('weekly-digest', {
                    to: user.email,
                    subject: 'Your Weekly NirnayPath Progress Report 📈',
                    html
                });

            } catch (err) {
                console.error(`[Worker] Failed to process digest for user ${user._id}:`, err);
            }
        }
    }, { connection, concurrency: 1 }); // Low concurrency for batch job

    worker.on('completed', (job) => console.log(`[Worker] Digest job ${job.id} completed.`));
    return worker;
};

module.exports = { createDigestWorker };
