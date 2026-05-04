const User = require('../models/User');
const TestResult = require('../models/TestResult');
const { sendResultEmail } = require('./emailService'); // Reusing existing mailer setup if possible or create a new one
const nodemailer = require('nodemailer');

const generateWeeklyDigest = async () => {
    console.log('Generating weekly digests...');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
        const users = await User.find({ email: { $exists: true } });
        
        for (const user of users) {
            const results = await TestResult.find({
                userId: user._id,
                createdAt: { $gte: sevenDaysAgo }
            });

            if (results.length === 0) continue; // Skip if no activity

            // Calculate stats
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

            // Send Email
            await sendDigestEmail(user, {
                totalTests,
                avgAccuracy,
                bestSubject,
                worstSubject,
                streak: user.streakCount,
                modeStats
            });
        }
        console.log('Weekly digests sent successfully');
    } catch (error) {
        console.error('Error generating weekly digest:', error);
    }
};

const sendDigestEmail = async (user, stats) => {
    try {
        let transporter;
        if (process.env.EMAIL_HOST) {
            transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });
        } else {
            console.log(`[Digest Simulation] To: ${user.email}, Stats:`, stats);
            return;
        }

        const mailOptions = {
            from: '"NirnayPath" <noreply@nirnaypath.com>',
            to: user.email,
            subject: 'Your Weekly NirnayPath Progress Report 📈',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 15px; color: #333;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1B3A6B; margin-bottom: 5px;">Weekly Progress Digest</h1>
                        <p style="color: #666; font-size: 1.1em;">Keep climbing toward your goal, ${user.name}!</p>
                    </div>

                    <div style="background: linear-gradient(135deg, #1B3A6B 0%, #3498db 100%); padding: 25px; border-radius: 12px; color: white; margin-bottom: 30px; text-align: center;">
                        <div style="display: flex; justify-content: space-around;">
                            <div style="flex: 1;">
                                <div style="font-size: 2em; font-weight: bold;">${stats.totalTests}</div>
                                <div style="font-size: 0.9em; opacity: 0.9;">Tests Taken</div>
                            </div>
                            <div style="flex: 1; border-left: 1px solid rgba(255,255,255,0.2); border-right: 1px solid rgba(255,255,255,0.2);">
                                <div style="font-size: 2em; font-weight: bold;">${stats.avgAccuracy}%</div>
                                <div style="font-size: 0.9em; opacity: 0.9;">Avg Accuracy</div>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 2em; font-weight: bold;">${stats.streak} 🔥</div>
                                <div style="font-size: 0.9em; opacity: 0.9;">Current Streak</div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #1B3A6B; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Subject Analysis</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;"><strong>🚀 Strongest:</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #27ae60; font-weight: bold;">${stats.bestSubject}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;"><strong>⚠️ Needs Focus:</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #e74c3c; font-weight: bold;">${stats.worstSubject}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                        <h3 style="margin-top: 0; font-size: 1.1em;">Activity Breakdown</h3>
                        <div style="display: flex; font-size: 0.9em;">
                            <div style="margin-right: 20px;">Full Mocks: <strong>${stats.modeStats.full}</strong></div>
                            <div style="margin-right: 20px;">Topic Drills: <strong>${stats.modeStats.drill}</strong></div>
                            <div>Sections: <strong>${stats.modeStats.section}</strong></div>
                        </div>
                    </div>

                    <div style="text-align: center;">
                        <a href="http://nirnaypath.com/dashboard" style="display: inline-block; background-color: #1B3A6B; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Resume Learning</a>
                        <p style="font-size: 0.8em; color: #999; margin-top: 20px;">You are receiving this because you are a registered aspirant at NirnayPath.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending digest to ${user.email}:`, error);
    }
};

module.exports = { generateWeeklyDigest };
