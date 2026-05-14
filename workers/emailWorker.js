const { Worker } = require('bullmq');
const { connection } = require('../services/queueService');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { recordMetric } = require('../services/emailMetrics');

let transporter;

const getTransporter = () => {
    if (transporter) return transporter;
    if (!process.env.EMAIL_HOST) return null;

    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    return transporter;
};

const createEmailWorker = () => {
    const worker = new Worker('email-queue', async (job) => {
        const { to, subject, html, _metadata } = job.data;
        const type = _metadata?.emailType || job.name;
        
        // Calculate Queue Latency
        const queueDelay = _metadata?.enqueuedAt ? (Date.now() - _metadata.enqueuedAt) : 0;

        logger.info(`Processing email: ${type}`, { 
            to, 
            requestId: _metadata?.requestId, 
            userId: _metadata?.userId,
            queueDelayMs: queueDelay
        });

        const mailTransporter = getTransporter();
        if (!mailTransporter) {
            logger.warn('Email transporter not configured. Skipping send.', { type, to });
            await recordMetric('sent', type);
            return;
        }

        await mailTransporter.sendMail({
            from: '"NirnayPath" <noreply@nirnaypath.com>',
            to,
            subject,
            html
        });

        await recordMetric('sent', type);
    }, { 
        connection,
        concurrency: 5,
        limiter: { max: 10, duration: 1000 } // Global limit across workers
    });

    worker.on('completed', (job) => {
        const type = job.data?._metadata?.emailType || job.name;
        logger.info(`Email job ${job.id} completed.`, { jobId: job.id, type });
    });

    worker.on('failed', async (job, err) => {
        const type = job.data?._metadata?.emailType || job.name;
        logger.error(`Email job ${job.id} failed.`, { 
            jobId: job.id, 
            type, 
            error: err.message,
            attempts: job.attemptsMade 
        });

        await recordMetric('failed', type);

        // Simulation of DLQ persistence
        if (job.attemptsMade >= 5) {
            await recordMetric('dlq', 'count');
            const fs = require('fs');
            const path = require('path');
            const dlqPath = path.join(__dirname, '../logs/dlq_failed_jobs.log');
            const logEntry = JSON.stringify({
                timestamp: new Date().toISOString(),
                jobId: job.id,
                data: job.data,
                error: err.message
            }) + '\n';
            
            try {
                if (!fs.existsSync(path.dirname(dlqPath))) fs.mkdirSync(path.dirname(dlqPath), { recursive: true });
                fs.appendFileSync(dlqPath, logEntry);
            } catch (logErr) {
                console.error('[Worker] Failed to write to DLQ log:', logErr.message);
            }
        }
    });

    return worker;
};

module.exports = { createEmailWorker };
