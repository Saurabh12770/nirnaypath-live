const nodemailer = require('nodemailer');

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

        // Configure transporter
        let transporter;
        if (process.env.EMAIL_HOST) {
            transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        } else {
            // Log to console for development if no SMTP configured
            console.log('\n--- EMAIL SIMULATION ---');
            console.log(`To: ${user.email}`);
            const modeTag = result.mode === 'full' ? '' : `[${result.mode.toUpperCase()}: ${result.modeValue}] `;
            console.log(`Subject: Test Result: ${modeTag}${result.testName}`);
            console.log(`Content: Score: ${result.score}, Accuracy: ${result.accuracy}%`);
            console.log(`Weakest Topic: ${weakestTopic}`);
            console.log(`Suggestion: ${improvementSuggestion}`);
            console.log('--- END SIMULATION ---\n');
            return;
        }

        const mailOptions = {
            from: '"NirnayPath" <noreply@nirnaypath.com>',
            to: user.email,
            subject: `Performance Report: ${result.mode !== 'full' ? '[' + result.mode.toUpperCase() + '] ' : ''}${result.testName}`,
            html: `
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
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${user.email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendResultEmail };
