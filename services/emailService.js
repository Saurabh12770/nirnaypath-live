const { addEmailJob } = require('./queueService');
const PerformanceAnalyticsService = require('./performanceAnalyticsService');
const Question = require('../models/question');
const fs = require('fs');
const path = require('path');

/**
 * Fallback: Log to Dead-Letter storage if the primary queue fails
 */
const logToDeadLetter = (type, payload, error) => {
    const dlqDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
    const dlqPath = path.join(dlqDir, 'email_dead_letter.jsonl');
    
    const entry = JSON.stringify({
        timestamp: new Date().toISOString(),
        type,
        recipient: payload.user?.email || payload.to,
        error: error.message || error,
        payload
    }) + '\n';

    try {
        if (!fs.existsSync(dlqDir)) fs.mkdirSync(dlqDir, { recursive: true });
        fs.appendFileSync(dlqPath, entry);
        console.warn(`[EmailService] CRITICAL: Job moved to DLQ storage: ${type}`);
    } catch (fsErr) {
        console.error('[EmailService] DLQ Storage Failure:', fsErr.message);
    }
};

/**
 * Unified Dispatcher
 */
const sendEmail = async (typeOrTo, payloadOrType, context) => {
    let to, type, payload;
    if (typeof payloadOrType === 'string') {
        to = typeOrTo;
        type = payloadOrType;
        payload = context || {};
        if (!payload.user) {
            payload.user = { email: to, name: payload.name || 'Student' };
        } else if (!payload.user.email) {
            payload.user.email = to;
        }
    } else {
        type = typeOrTo;
        payload = payloadOrType || {};
    }

    const { user } = payload;
    if (!user || !user.email) {
        console.error(`[EmailService] Dispatch failed: No recipient for ${type}`);
        return;
    }

    try {
        let subject = '';
        let html = '';

        switch (type.toUpperCase()) {
            case 'WELCOME':
                subject = 'Welcome to NirnayPath - Your Journey Starts Here!';
                html = `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #334155; line-height: 1.6;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">NirnayPath</h1>
                            <p style="color: #64748b; margin: 5px 0 0;">Empowering Your Success</p>
                        </div>
                        <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${user.name}!</h2>
                            <p>We're thrilled to have you join NirnayPath. Your account is ready, and a world of high-quality mock tests and deep performance analytics awaits you.</p>
                            
                            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0;">
                                <h3 style="color: #2563eb; font-size: 16px; margin-top: 0;">Quick Start Guide:</h3>
                                <ul style="padding-left: 20px; margin-bottom: 0;">
                                    <li style="margin-bottom: 10px;"><b>Take a Drill:</b> Test your knowledge on specific subjects.</li>
                                    <li style="margin-bottom: 10px;"><b>Full Mocks:</b> Experience real exam environments.</li>
                                    <li><b>Track Progress:</b> Watch your accuracy grow on your dashboard.</li>
                                </ul>
                            </div>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.BASE_URL || 'http://nirnaypath.com'}/dashboard" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Start Your First Test</a>
                            </div>
                        </div>
                        <p style="text-align: center; font-size: 14px; color: #94a3b8; margin-top: 30px;">
                            Questions? Just reply to this email. We're here to help!
                        </p>
                    </div>
                `;
                break;

            case 'PASSWORD_RESET':
                const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password.html?token=${payload.token}`;
                subject = 'Password Reset Request - NirnayPath';
                html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px;">
                        <h2 style="color: #0f172a; margin-top: 0;">Reset Your Password</h2>
                        <p>Hi ${user.name}, we received a request to reset your NirnayPath password. Click the button below to choose a new one:</p>
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
                        </div>
                        <p style="font-size: 14px; color: #64748b;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0;">
                        <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">Direct Link: ${resetUrl}</p>
                    </div>
                `;
                break;

            case 'TEST_REPORT':
                const { result } = payload;
                const topicErrors = {};
                
                // 1. Identify incorrect answers from server-validated results
                const incorrectAnswers = (result.answers || []).filter(a => !a.isCorrect);
                
                if (incorrectAnswers.length > 0) {
                    try {
                        // 2. Fetch Topic Mapping from Source of Truth (Database)
                        const qIds = incorrectAnswers.map(a => a.questionId).filter(id => id);
                        const questions = await Question.find({ 
                            $or: [
                                { _id: { $in: qIds.filter(id => id.length === 24) } },
                                { id: { $in: qIds } }
                            ]
                        }).select('topic topicId').lean();

                        // 3. Aggregate error counts per topic
                        incorrectAnswers.forEach(ans => {
                            const qData = questions.find(q => 
                                q._id?.toString() === ans.questionId || q.id === ans.questionId
                            );
                            const topicName = qData?.topic || qData?.topicId || 'General Concepts';
                            topicErrors[topicName] = (topicErrors[topicName] || 0) + 1;
                        });
                    } catch (dbErr) {
                        console.error('[EmailService][Analytics] Topic lookup failed:', dbErr.message);
                    }
                }

                // 4. Compute Weakest Topic
                let weakestTopic = 'General Concepts';
                let maxErrors = 0;
                for (const t in topicErrors) {
                    if (topicErrors[t] > maxErrors) {
                        maxErrors = topicErrors[t];
                        weakestTopic = t;
                    }
                }

                // 5. Fetch Global Intelligence
                let intelligence = { score: 0, confidence: 'Low' };
                try {
                    intelligence = await PerformanceAnalyticsService.getReadiness(user._id);
                } catch (intelErr) {
                    console.error('[EmailService][Intelligence] Readiness fetch failed:', intelErr.message);
                }

                subject = `Performance Report: ${result.testName || result.subject}`;
                html = `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; color: #334155;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <span style="background-color: #dcfce7; color: #166534; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">Test Completed</span>
                        </div>
                        
                        <h2 style="color: #1e293b; margin-top: 0; text-align: center;">Performance Snapshot</h2>
                        
                        <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #f1f5f9;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 10px 0; color: #64748b;">Subject</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${result.subject}</td></tr>
                                <tr><td style="padding: 10px 0; color: #64748b;">Score</td><td style="padding: 10px 0; font-weight: 600; text-align: right; color: #2563eb; font-size: 20px;">${result.score} / ${result.totalQuestions}</td></tr>
                                <tr><td style="padding: 10px 0; color: #64748b;">Accuracy</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${result.accuracy}%</td></tr>
                                <tr><td style="padding: 10px 0; color: #64748b;">Time Spent</td><td style="padding: 10px 0; font-weight: 600; text-align: right;">${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s</td></tr>
                            </table>
                        </div>

                        <div style="display: flex; gap: 20px; margin-bottom: 30px;">
                            <div style="flex: 1; border-left: 4px solid #f59e0b; padding: 10px 15px; background: #fffbeb; border-radius: 0 8px 8px 0;">
                                <h4 style="margin: 0; color: #92400e; font-size: 14px;">Focus Area</h4>
                                <p style="margin: 5px 0 0; font-size: 13px; color: #b45309;"><b>${weakestTopic}</b></p>
                            </div>
                            <div style="flex: 1; border-left: 4px solid #10b981; padding: 10px 15px; background: #ecfdf5; border-radius: 0 8px 8px 0;">
                                <h4 style="margin: 0; color: #065f46; font-size: 14px;">Exam Readiness</h4>
                                <p style="margin: 5px 0 0; font-size: 13px; color: #047857;"><b>${intelligence.score || 'N/A'}%</b> (${intelligence.confidence})</p>
                            </div>
                        </div>

                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.BASE_URL || 'http://nirnaypath.com'}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">View Full Intelligence Dashboard</a>
                        </div>
                    </div>
                `;
                break;

            case 'PAYMENT_SUCCESS':
                // M-2 FIX: Razorpay amount is in paise (1 INR = 100 paise).
                // Divide by 100 before displaying so email shows "INR 499.00" not "INR 49900".
                const displayAmount = (Number(payload.amount) / 100).toFixed(2);
                subject = 'Payment Successful - Welcome to NirnayPath Pro!';
                html = `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #334155; line-height: 1.6;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #10b981; margin: 0; font-size: 28px;">NirnayPath Pro</h1>
                            <p style="color: #64748b; margin: 5px 0 0;">Empowering Your Exam Success</p>
                        </div>
                        <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <h2 style="color: #10b981; margin-top: 0; text-align: center;">Payment Successful!</h2>
                            <p>Hi ${user.name}, your payment of <b>INR ${displayAmount}</b> for the <b>${payload.planName || 'Pro'}</b> plan was successfully processed.</p>
                            <p>Your subscription is now active until <b>${payload.expiryDate || 'N/A'}</b>.</p>
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="${process.env.BASE_URL || 'http://nirnaypath.com'}/dashboard" style="background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Go to Dashboard</a>
                            </div>
                            <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 20px;">Enjoy your unlimited tests and full access to intelligence analytics!</p>
                        </div>
                    </div>
                `;
                break;

            case 'SUBSCRIPTION_EXPIRED':
                subject = 'Your Pro Subscription Has Expired - NirnayPath';
                html = `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #334155; line-height: 1.6;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #ef4444; margin: 0; font-size: 28px;">NirnayPath</h1>
                        </div>
                        <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <h2 style="color: #ef4444; margin-top: 0; text-align: center;">Subscription Expired</h2>
                            <p>Hi ${user.name}, your NirnayPath Pro subscription has expired and your account has been downgraded to the Free tier.</p>
                            <p>You can upgrade back to Pro at any time to regain unlimited access to sectional tests and advanced performance insights.</p>
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="${process.env.BASE_URL || 'http://nirnaypath.com'}/dashboard" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Renew Subscription</a>
                            </div>
                        </div>
                    </div>
                `;
                break;

            default:
                throw new Error(`Invalid email type: ${type}`);
        }

        // Add to BullMQ Queue
        await addEmailJob(type.toLowerCase(), { to: user.email, subject, html });
        console.log(`[EmailService] ${type} email job added to queue for: ${user.email}`);

    } catch (err) {
        console.error(`[EmailService] Unified Pipeline Error for ${type}:`, err.message);
        // Fallback to DLQ storage
        logToDeadLetter(type, payload, err);
    }
};

/**
 * Backward Compatibility Layers
 * These ensure auth.js and test.js continue to work without modification.
 */
const sendResultEmail = async (user, result) => await sendEmail('TEST_REPORT', { user, result });
const sendPasswordResetEmail = async (user, token) => await sendEmail('PASSWORD_RESET', { user, token });
const sendWelcomeEmail = async (user) => await sendEmail('WELCOME', { user });

module.exports = {
    sendEmail,
    sendResultEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail
};
