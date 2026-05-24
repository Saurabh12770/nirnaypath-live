const fs = require('fs');
const path = require('path');
const context = require('./context');

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'runtime_trace.json');

const LOGGING_MODE = process.env.LOGGING_MODE || "console";
const memoryTraceBuffer = [];
const MAX_MEMORY_TRACES = 1000;

function pushToMemoryTrace(entry) {
    memoryTraceBuffer.push(entry);
    if (memoryTraceBuffer.length > MAX_MEMORY_TRACES) {
        memoryTraceBuffer.shift();
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
// Defer creation to runtime trace execution to guarantee absolute boot safety.

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

    const logStr = JSON.stringify(logEntry);

    if (LOGGING_MODE === 'memory') {
        pushToMemoryTrace(logEntry);
    } else if (LOGGING_MODE === 'file') {
        try {
            ensureDir(LOG_DIR);
            fs.appendFileSync(LOG_FILE, logStr + '\n');
        } catch (err) {
            process.stderr.write(`Failed to write trace log: ${err.message}\n`);
            pushToMemoryTrace({ ...logEntry, error: err.message });
        }
    } else {
        // default/console mode: keep in-memory backup and print
        pushToMemoryTrace(logEntry);
    }

    // Also log to stdout in non-production or when LOGGING_MODE is console
    if (LOGGING_MODE === 'console' || process.env.NODE_ENV !== 'production') {
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
    },
    getMemoryTraces: () => memoryTraceBuffer
};
