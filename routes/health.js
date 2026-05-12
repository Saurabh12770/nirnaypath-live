const express = require('express');
const router = express.Router();
const { getMetrics } = require('../services/emailMetrics');
const { emailQueue } = require('../services/queueService');

/**
 * GET /api/health/email
 * Comprehensive observability for the email subsystem
 */
router.get('/email', async (req, res) => {
    try {
        const [metrics, waiting, active, failed, completed, waitingJobs] = await Promise.all([
            getMetrics(),
            emailQueue.getWaitingCount(),
            emailQueue.getActiveCount(),
            emailQueue.getFailedCount(),
            emailQueue.getCompletedCount(),
            emailQueue.getWaiting(0, 0) // Get the oldest waiting job for lag check
        ]);

        // --- PRODUCTION RELIABILITY CHECKS ---
        
        // 1. Queue Lag Calculation (Time in queue)
        let oldestJobLagMs = 0;
        if (waitingJobs.length > 0) {
            oldestJobLagMs = Date.now() - waitingJobs[0].timestamp;
        }

        // 2. DLQ Alert System
        const dlqCount = parseInt(metrics.dlq?.count || 0);
        const hasDlqAlert = dlqCount > 0;

        // 3. System Status Logic (Harden against "Stuck" workers)
        // Degrade if: 
        // - Waiting count is high (> 20)
        // - Oldest job has been stuck for > 2 minutes
        // - Failed rate is > 30% of completed
        const isStuck = waiting > 20 || oldestJobLagMs > 120000;
        const highFailureRate = completed > 10 && failed > (completed * 0.3);
        
        let status = 'healthy';
        if (isStuck || highFailureRate) status = 'degraded';
        if (hasDlqAlert && status === 'healthy') status = 'degraded'; // DLQ presence requires attention

        res.json({
            status,
            timestamp: new Date().toISOString(),
            alerts: {
                dlqPresent: hasDlqAlert,
                workerStall: oldestJobLagMs > 60000,
                highFailureRate
            },
            queue: {
                waiting,
                active,
                failed,
                completed,
                oldestJobLagMs
            },
            metrics
        });
    } catch (err) {
        res.status(500).json({ status: 'unhealthy', error: err.message });
    }
});

module.exports = router;
