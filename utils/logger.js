const context = require('./context');

const log = (level, message, meta = {}) => {
    const store = context.getStore() || {};
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        requestId: meta.requestId || store.requestId,
        userId: meta.userId || store.userId,
        emailType: meta.emailType || meta.type,
        ...meta
    };
    // Ensure we don't log sensitive info
    delete logEntry.password;
    delete logEntry.token;
    
    console.log(JSON.stringify(logEntry));
};

module.exports = {
    info: (msg, meta) => log('info', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta)
};
