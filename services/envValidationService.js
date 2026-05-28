'use strict';

/**
 * NirnayPath — Environment Security Validation Service (Phase 2)
 * =============================================================
 * Ensures all required environment variables are present and secure before the app boots.
 * Gracefully reports degraded optional services rather than crashing.
 */

function validateEnv() {
    const active = [];
    const degraded = [];
    const errors = [];

    // ==========================================
    // 1. REQUIRED (FAIL FAST)
    // ==========================================

    // NODE_ENV Check
    if (!process.env.NODE_ENV) {
        errors.push("NODE_ENV is missing.");
    }

    // MONGO_URI Check
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        errors.push("MONGO_URI or MONGODB_URI is missing.");
    } else {
        active.push("MongoDB");
    }

    // JWT_SECRET Check (min 32 chars)
    if (!process.env.JWT_SECRET) {
        errors.push("JWT_SECRET is missing.");
    } else if (process.env.JWT_SECRET.length < 32) {
        errors.push(`JWT_SECRET must be at least 32 characters (currently ${process.env.JWT_SECRET.length}).`);
    }

    // REFRESH_TOKEN_SECRET Check (min 32 chars)
    if (!process.env.REFRESH_TOKEN_SECRET) {
        errors.push("REFRESH_TOKEN_SECRET is missing.");
    } else if (process.env.REFRESH_TOKEN_SECRET.length < 32) {
        errors.push(`REFRESH_TOKEN_SECRET must be at least 32 characters (currently ${process.env.REFRESH_TOKEN_SECRET.length}).`);
    }

    // Auth is fully functional if both secrets are valid
    if (
        process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32 &&
        process.env.REFRESH_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET.length >= 32
    ) {
        active.push("Auth");
    }

    // Exit immediately if there are validation failures for required fields
    if (errors.length > 0) {
        console.error("\n====================================================");
        console.error("CRITICAL FAILURE: ENVIRONMENT VALIDATION FAILED");
        console.error("====================================================");
        errors.forEach(err => console.error(`✖ ${err}`));
        console.error("====================================================\n");
        process.exit(1);
    }

    // ==========================================
    // 2. OPTIONAL (WARN ONLY)
    // ==========================================

    // Redis
    if (process.env.REDIS_URL && process.env.REDIS_URL.trim() !== '') {
        active.push("Redis");
    } else {
        degraded.push("Redis");
    }

    // SMTP variables
    const hasSmtp = process.env.EMAIL_HOST &&
                    process.env.EMAIL_PORT &&
                    process.env.EMAIL_USER &&
                    (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD);
    if (hasSmtp) {
        active.push("SMTP");
    } else {
        degraded.push("SMTP");
    }

    // Razorpay (Key ID, Secret, and Webhook Secret)
    const hasRazorpay = process.env.RAZORPAY_KEY_ID &&
                        process.env.RAZORPAY_KEY_SECRET &&
                        process.env.RAZORPAY_WEBHOOK_SECRET;
    if (hasRazorpay) {
        active.push("Razorpay");
    } else {
        degraded.push("Razorpay");
    }

    // Sentry DSN
    if (process.env.SENTRY_DSN && process.env.SENTRY_DSN.trim() !== '') {
        active.push("Sentry");
    } else {
        degraded.push("Sentry");
    }

    // ==========================================
    // 3. LOGGING STAGE (Strictly structured layout)
    // ==========================================
    console.log("");
    console.log("✓ ACTIVE SERVICES:");
    active.forEach(service => console.log(`* ${service}`));
    console.log("");

    if (degraded.length > 0) {
        console.log("⚠ DEGRADED SERVICES:");
        degraded.forEach(service => console.log(`* ${service}`));
        console.log("");
    }
}

module.exports = { validateEnv };
