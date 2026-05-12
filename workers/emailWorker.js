const { Worker } = require('bullmq');
const { connection } = require('../services/queueService');
const nodemailer = require('nodemailer');

const createEmailWorker = () => {
    const worker = new Worker('email-queue', async (job) => {
        const { to, subject, html } = job.data;
        console.log(`[Worker] Processing email to ${to} (${job.name})`);

        if (!process.env.EMAIL_HOST) {
            console.log('--------------------------------------------------');
            console.log(`[Worker] NO EMAIL HOST CONFIGURED`);
            console.log(`[Worker] To: ${to}`);
            console.log(`[Worker] Subject: ${subject}`);
            console.log(`[Worker] Content: ${html}`);
            console.log('--------------------------------------------------');
            return;
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: '"NirnayPath" <noreply@nirnaypath.com>',
            to,
            subject,
            html
        });
    }, { connection });

    worker.on('completed', (job) => console.log(`[Worker] Email job ${job.id} completed.`));
    worker.on('failed', (job, err) => console.error(`[Worker] Email job ${job.id} failed:`, err));

    return worker;
};

module.exports = { createEmailWorker };
