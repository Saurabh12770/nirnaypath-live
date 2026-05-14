const fs = require('fs');
const path = require('path');
const context = require('./context');

const LOG_DIR = path.join(__dirname, '../logs');
const LOG_FILE = path.join(LOG_DIR, 'runtime_trace.json');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Structured Runtime Trace Logger
 * Used for forensic debugging of critical flows
 */
const trace = (category, message, data = {}) => {
    const store = context.getStore() || {};
    
    const logEntry = {
        timestamp: new Date().toISOString(),
        category,
        message,
        requestId: store.requestId,
        userId: store.userId || data.userId,
        ...data
    };

    // Prevent recursive logging or sensitive data leaks
    delete logEntry.password;
    if (logEntry.token && category !== 'PASSWORD_FLOW') {
        delete logEntry.token;
    }

    try {
        fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
    } catch (err) {
        process.stderr.write(`Failed to write trace log: ${err.message}\n`);
    }

    // Also log to stdout in non-production for visibility
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[TRACE][${category}] ${message}`, JSON.stringify(data));
    }
};

module.exports = {
    trace,
    CATEGORIES: {
        QUESTION_FLOW: 'QUESTION_FLOW',
        TEST_FLOW: 'TEST_FLOW',
        ADMIN_FLOW: 'ADMIN_FLOW',
        PASSWORD_FLOW: 'PASSWORD_FLOW'
    }
};
