const queueService = require('./queueService');

const recordMetric = async (category, field, increment = 1) => {
    try {
        const conn = queueService.getConnection();
        if (!conn) return;
        await conn.hincrby(`metrics:email:${category}`, field, increment);
    } catch (err) {
        // Silent fail to prevent side-effects on primary flow
    }
};

const getMetrics = async () => {
    try {
        const conn = queueService.getConnection();
        if (!conn) return { sent: {}, failed: {}, dlq: {} };
        const [sent, failed, dlq] = await Promise.all([
            conn.hgetall('metrics:email:sent'),
            conn.hgetall('metrics:email:failed'),
            conn.hgetall('metrics:email:dlq')
        ]);
        return { sent: sent || {}, failed: failed || {}, dlq: dlq || {} };
    } catch (err) {
        return { error: 'Failed to fetch metrics' };
    }
};

module.exports = { recordMetric, getMetrics };
