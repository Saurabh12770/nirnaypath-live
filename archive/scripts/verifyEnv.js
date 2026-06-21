const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const REQUIRED_VARS = [
    'MONGO_URI',
    'JWT_SECRET',
    'PORT',
    'ADMIN_EMAIL'
];

const OPTIONAL_VARS = [
    'REDIS_URL',
    'EMAIL_USER',
    'EMAIL_PASS',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
];

const report = {
    timestamp: new Date().toISOString(),
    missingRequired: [],
    missingOptional: [],
    status: 'UNKNOWN'
};

REQUIRED_VARS.forEach(v => {
    if (!process.env[v]) report.missingRequired.push(v);
});

OPTIONAL_VARS.forEach(v => {
    if (!process.env[v]) report.missingOptional.push(v);
});

report.status = report.missingRequired.length === 0 ? 'SUCCESS' : 'FAILURE';

fs.writeFileSync(path.join(__dirname, '..', 'logs', 'env_verification.json'), JSON.stringify(report, null, 2));
console.log(`Environment verification complete. Status: ${report.status}`);
if (report.missingRequired.length > 0) {
    console.error('CRITICAL: Missing required variables:', report.missingRequired.join(', '));
}
