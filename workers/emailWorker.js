const { Worker } = require('bullmq');
const { getConnection } = require('../services/queueService');
const { isRedisAvailable } = require('../services/redisService');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { recordMetric } = require('../services/emailMetrics');

let _transporter = null;

const getTransporter = () => {
    if (_transporter) return _transporter;
    if (!process.env.EMAIL_HOST) return null;
    _transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    return _transporter;
};

const createEmailWorker = () => {
    const connection = getConnection();
    if (!connection || !isRedisAvailable()) {
        logger.warn('[WORKER][Email] Redis not available. Email worker not started.');
        return null;
    }

    const worker = new Worker('email-queue', async (job) => {
        const { to, subject, html, _metadata, _type } = job.data;
        const type = _metadata?.emailType || _type || job.name;
        const queueDelay = _metadata?.enqueuedAt ? Date.now() - _metadata.enqueuedAt : 0;

        logger.info(`[WORKER][Email] Processing: ${type}`, { to, queueDelayMs: queueDelay });

        const transport = getTransporter();
        if (!transport) {
            logger.warn('[WORKER][Email] No EMAIL_HOST set. Skipping send.', { type, to });
            await recordMetric('sent', type).catch(() => {});
            return;
        }

        await transport.sendMail({
            from: '"NirnayPath" <noreply@nirnaypath.com>',
            to, subject, html,
        });

        await recordMetric('sent', type).catch(() => {});
    }, {
        connection,
        concurrency: 5,
        limiter: { max: 10, duration: 1000 },
    });

    worker.on('completed', (job) => {
        const type = job.data?._metadata?.emailType || job.data?._type || job.name;
        logger.info(`[WORKER][Email] Job ${job.id} completed.`, { type });
    });

    worker.on('failed', async (job, err) => {
        const type = job?.data?._metadata?.emailType || job?.data?._type || job?.name;
        logger.error(`[WORKER][Email] Job ${job?.id} failed.`, { type, error: err.message, attempts: job?.attemptsMade });
        await recordMetric('failed', type).catch(() => {});

        if (job?.attemptsMade >= 5) {
            await recordMetric('dlq', 'count').catch(() => {});
            try {
                const fs = require('fs');
                const path = require('path');
                const dlqDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
                if (!fs.existsSync(dlqDir)) fs.mkdirSync(dlqDir, { recursive: true });
                fs.appendFileSync(
                    path.join(dlqDir, 'dlq_failed_jobs.log'),
                    JSON.stringify({ timestamp: new Date().toISOString(), jobId: job.id, type, error: err.message }) + '\n'
                );
            } catch (logErr) {
                logger.error('[WORKER][Email] DLQ write failed:', { error: logErr.message });
            }
        }
    });

    // CRITICAL: Without this, BullMQ internal errors become uncaught exceptions
    worker.on('error', (err) => {
        logger.error('[WORKER][Email] Worker internal error (non-fatal):', { error: err.message });
    });

    return worker;
};

module.exports = { createEmailWorker };
