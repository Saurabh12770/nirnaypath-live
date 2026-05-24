/**
 * NirnayPath Structured Logger (Phase 9 — SRE Production Hardened)
 * ==============================================================
 * Ultra-performance structured JSON logging system with:
 *  - Automated log classification and routing to domain files:
 *      * logs/combined.log  — full application traces
 *      * logs/error.log     — only error / fatal alerts
 *      * logs/security.log  — authorization breaches & anti-cheat alerts
 *      * logs/webhooks.log  — payment webhooks & critical state updates
 *      * logs/cache.log     — caching hit/miss & eviction audits
 *  - Automatic AsyncLocalStorage correlation (X-Request-ID propagation)
 *  - Size-based log rotation (10MB bounds) to prevent disk space leaks
 *  - Intelligent Error Serialization (capturing stacks, messages, and codes)
 *  - Sensitive payload redaction (passwords, tokens, raw webhooks)
 *  - Beautiful colorized pretty-printing in local development mode
 */

'use strict';

const fs = require('fs');
const path = require('path');
const context = require('./context');

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const LOGS_DIR = LOG_DIR;

const LOGGING_MODE = process.env.LOGGING_MODE || "console";
const memoryLogBuffer = [];
const MAX_MEMORY_LOGS = 1000;

function pushToMemoryBuffer(entry) {
    memoryLogBuffer.push(entry);
    if (memoryLogBuffer.length > MAX_MEMORY_LOGS) {
        memoryLogBuffer.shift();
    }
}

function ensureDir(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    } catch (err) {
        console.warn("[LOGGER] Log directory creation failed, falling back to memory logs only:", err.message);
    }
}

// Ensure log directory exists safely
// Defer creation to runtime appendToLogFile to guarantee startup safety in read-only environments.

/**
 * Append content to a specific log file with size-based rotation.
 * 
 * @param {string} filename File name inside logs/ directory
 * @param {string} content JSON formatted log entry string
 */
function appendToLogFile(filename, content) {
    if (LOGGING_MODE === 'console') {
        // console mode, no disk writing, stdout is printed already
        return;
    }
    if (LOGGING_MODE === 'memory') {
        pushToMemoryBuffer({ filename, content });
        return;
    }

    try {
        ensureDir(LOGS_DIR);
        const filePath = path.join(LOGS_DIR, filename);
        
        // Dynamic Log Rotation Invariant: Rotate if file size exceeds 10MB
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size > 10 * 1024 * 1024) { // 10MB Limit
                const rotatedPath = `${filePath}.${Date.now()}.bak`;
                fs.renameSync(filePath, rotatedPath);
            }
        }
        
        fs.appendFileSync(filePath, content + '\n', 'utf8');
    } catch (err) {
        // Fail-safe: Never crash the application due to logging disk failures
        console.error(`[LOGGER_DISK_ERROR] Failed to write to file "${filename}": ${err.message}`);
        pushToMemoryBuffer({ filename, content, error: err.message });
    }
}

/**
 * Serialize Error objects safely into clean JSON trees.
 * 
 * @param {Error} err Standard JS Error object
 * @returns {object} Clean serialized error structure
 */
function serializeError(err) {
    if (!err) return {};
    return {
        message: err.message,
        stack: err.stack,
        code: err.code || err.statusCode || null
    };
}

/**
 * Core logging dispatch function
 * 
 * @param {string} level Log level ('info', 'warn', 'error', 'debug', 'fatal')
 * @param {string} message Log message body
 * @param {object} meta Contextual metadata fields
 */
const log = (level, message, meta = {}) => {
    const store = context.getStore() || {};
    
    // Clone metadata and perform clean error serialization
    let serializedMeta = { ...meta };
    if (serializedMeta.error && serializedMeta.error instanceof Error) {
        serializedMeta.error = serializeError(serializedMeta.error);
    }
    if (serializedMeta.err && serializedMeta.err instanceof Error) {
        serializedMeta.err = serializeError(serializedMeta.err);
    }

    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        requestId: serializedMeta.requestId || store.requestId || null,
        userId: serializedMeta.userId || store.userId || null,
        ...serializedMeta
    };

    // Strict Redaction Layer: Filter out sensitive keys from any audit traces
    const sensitiveKeys = ['password', 'token', 'refreshToken', 'rawBody', 'creditCard', 'otp'];
    sensitiveKeys.forEach(key => {
        if (logEntry[key] !== undefined) delete logEntry[key];
    });

    const jsonString = JSON.stringify(logEntry);

    // Production Output: Standardized JSON stdout for log shippers (Railway, Datadog)
    if (process.env.NODE_ENV === 'production') {
        console.log(jsonString);
    } else {
        // Local Dev Output: Colorized and easily readable pretty-print format
        const colorMap = {
            info: '\x1b[32m',  // Green
            warn: '\x1b[33m',  // Yellow
            error: '\x1b[31m', // Red
            fatal: '\x1b[41m\x1b[37m', // Red BG + White text
            debug: '\x1b[36m'  // Cyan
        };
        const resetColor = '\x1b[0m';
        const color = colorMap[level] || resetColor;
        const reqStr = logEntry.requestId ? ` [req:${logEntry.requestId.substring(0, 8)}]` : '';
        const userStr = logEntry.userId ? ` [user:${logEntry.userId}]` : '';
        
        console.log(
            `[${logEntry.timestamp}] ${color}${level.toUpperCase()}${resetColor}${reqStr}${userStr}: ${message}`, 
            Object.keys(serializedMeta).length ? JSON.stringify(serializedMeta, null, 2) : ''
        );
    }

    // Domain Logging Routing (Asynchronous execution using setImmediate to protect HTTP latency)
    setImmediate(() => {
        // 1. Core Combined Trace Log
        appendToLogFile('combined.log', jsonString);

        // 2. Critical Alert Error Log
        if (level === 'error' || level === 'fatal') {
            appendToLogFile('error.log', jsonString);
        }

        // 3. Categorized Auditing Streams
        const category = (logEntry.category || '').toLowerCase().trim();
        const msgUpper = message.toUpperCase();

        // Security / Anti-Cheat Stream
        if (
            category === 'security' || 
            category === 'anti-cheat' || 
            msgUpper.includes('CHEAT') || 
            msgUpper.includes('VIOLATION') || 
            msgUpper.includes('UNAUTHORIZED') || 
            msgUpper.includes('SECURITY')
        ) {
            appendToLogFile('security.log', jsonString);
        }

        // Payment / Webhooks Stream
        if (
            category === 'webhook' || 
            category === 'payment' || 
            msgUpper.includes('WEBHOOK') || 
            msgUpper.includes('PAYMENT') ||
            msgUpper.includes('RAZORPAY')
        ) {
            appendToLogFile('webhooks.log', jsonString);
        }

        // Performance / Cache Stream
        if (
            category === 'cache' || 
            msgUpper.includes('CACHE') || 
            msgUpper.includes('LRU') || 
            msgUpper.includes('EVICTED')
        ) {
            appendToLogFile('cache.log', jsonString);
        }
    });
};

module.exports = {
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
    fatal: (msg, meta) => log('fatal', msg, meta),
    debug: (msg, meta) => log('debug', msg, meta),
    getMemoryLogs: () => memoryLogBuffer
};
