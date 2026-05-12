const { connection } = require('./queueService');

const recordMetric = async (category, field, increment = 1) => {
    try {
        await connection.hincrby(`metrics:email:${category}`, field, increment);
    } catch (err) {
        // Silent fail to prevent side-effects on primary flow
    }
};

const getMetrics = async () => {
    try {
        const [sent, failed, dlq] = await Promise.all([
            connection.hgetall('metrics:email:sent'),
            connection.hgetall('metrics:email:failed'),
            connection.hgetall('metrics:email:dlq')
        ]);
        return { sent, failed, dlq };
    } catch (err) {
        return { error: 'Failed to fetch metrics' };
    }
};

module.exports = { recordMetric, getMetrics };
