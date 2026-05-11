const { addEmailJob } = require('./queueService');

const sendResultEmail = async (user, result) => {
    try {
        // Find weakest topic
        const topicErrors = {};
        result.answers.forEach(ans => {
            if (!ans.isCorrect && ans.topic) {
                topicErrors[ans.topic] = (topicErrors[ans.topic] || 0) + 1;
            }
        });

        let weakestTopic = 'General Concepts';
        let maxErrors = 0;
        for (const topic in topicErrors) {
            if (topicErrors[topic] > maxErrors) {
                maxErrors = topicErrors[topic];
                weakestTopic = topic;
            }
        }

        const improvementSuggestion = `You struggled most with ${weakestTopic}. We recommend revising ${weakestTopic} related concepts from NCERT or standard textbooks for better performance.`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2c3e50;">Hello ${user.name},</h2>
                <p>Congratulations on completing your mock test on <strong>NirnayPath</strong>.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Test Summary</h3>
                    <table style="width: 100%;">
                         <tr><td><strong>Exam:</strong></td><td>${result.exam}</td></tr>
                         <tr><td><strong>Type:</strong></td><td>${result.mode === 'full' ? 'Full Mock Test' : (result.mode === 'drill' ? 'Topic Drill' : 'Sectional Test')}</td></tr>
                         ${result.modeValue ? `<tr><td><strong>Detail:</strong></td><td>${result.modeValue}</td></tr>` : ''}
                         <tr><td><strong>Subject:</strong></td><td>${result.subject}</td></tr>
                         <tr><td><strong>Score:</strong></td><td>${result.score} / ${result.totalQuestions}</td></tr>
                        <tr><td><strong>Accuracy:</strong></td><td>${result.accuracy}%</td></tr>
                    </table>
                </div>

                <div style="border-left: 4px solid #3498db; padding-left: 15px; margin: 20px 0;">
                    <h3 style="color: #2980b9;">Personalized Analysis</h3>
                    <p>${improvementSuggestion}</p>
                </div>

                <p>Keep practicing and track your progress on your personal dashboard.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://nirnaypath.com/dashboard" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
                </div>
            </div>
        `;

        // Queue the email instead of sending directly
        await addEmailJob('test-result', {
            to: user.email,
            subject: `Performance Report: ${result.mode !== 'full' ? '[' + result.mode.toUpperCase() + '] ' : ''}${result.testName}`,
            html
        });

        console.log(`Email job queued for ${user.email}`);
    } catch (error) {
        console.error('Error queuing result email:', error);
    }
};

const sendPasswordResetEmail = async (user, token) => {
    try {
        const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password.html?token=${token}`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2c3e50;">Password Reset Request</h2>
                <p>Hello ${user.name},</p>
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account on <strong>NirnayPath</strong>.</p>
                <p>Please click on the following button to complete the process:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset My Password</a>
                </div>
                
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <p>This link will expire in 1 hour.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #7f8c8d;">If the button above doesn't work, copy and paste this link into your browser:</p>
                <p style="font-size: 12px; color: #3498db; word-break: break-all;">${resetUrl}</p>
            </div>
        `;

        await addEmailJob('password-reset', {
            to: user.email,
            subject: 'NirnayPath Password Reset Request',
            html
        });

        console.log(`Password reset email queued for ${user.email}`);
    } catch (error) {
        console.error('Error queuing reset email:', error);
    }
};

module.exports = { sendResultEmail, sendPasswordResetEmail };
