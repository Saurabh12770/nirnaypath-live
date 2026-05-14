const User = require('../models/user');
const TestResult = require('../models/testResult');
const { sendResultEmail } = require('./emailService'); // Reusing existing mailer setup if possible or create a new one
const nodemailer = require('nodemailer');

const { addDigestJob } = require('./queueService');

const generateWeeklyDigest = async () => {
    try {
        await addDigestJob('weekly-digest', { timestamp: new Date() });
        console.log('Weekly digest job added to queue');
    } catch (error) {
        console.error('Error queuing weekly digest:', error);
    }
};

module.exports = { generateWeeklyDigest };
