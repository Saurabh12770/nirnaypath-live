'use strict';

/**
 * Environment Variables Integrity Validator
 * Runs during boot or CI/CD to prevent misconfiguration crashes in production.
 */
function validateEnvironment() {
    const REQUIRED_ENV = [
        'JWT_SECRET',
        'MONGO_URI',
        'PORT'
    ];

    const OPTIONAL_WARN_ENV = [
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET',
        'RAZORPAY_WEBHOOK_SECRET',
        'ADMIN_EMAIL'
    ];

    const missingRequired = [];
    REQUIRED_ENV.forEach(env => {
        if (!process.env[env]) {
            missingRequired.push(env);
        }
    });

    const missingWarnings = [];
    OPTIONAL_WARN_ENV.forEach(env => {
        if (!process.env[env]) {
            missingWarnings.push(env);
        }
    });

    if (missingRequired.length > 0) {
        console.error('❌  [ENV VALIDATOR ERROR] Missing critical production environment variables:');
        missingRequired.forEach(env => console.error(`    - ${env}`));
        console.error('========================================================================');
        return false;
    }

    console.log('✅  [ENV VALIDATOR] All required environment variables are present.');
    if (missingWarnings.length > 0) {
        console.warn('⚠️  [ENV VALIDATOR WARNING] Missing non-blocking configuration variables:');
        missingWarnings.forEach(env => console.warn(`    - ${env}`));
    }
    return true;
}

if (require.main === module) {
    const success = validateEnvironment();
    process.exit(success ? 0 : 1);
}

module.exports = validateEnvironment;
