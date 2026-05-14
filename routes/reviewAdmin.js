/**
 * Review Admin API Routes
 * Phase 5 - Admin Review Dashboard
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const ReviewQueueService = require('../services/reviewQueueService');
const ContentApprovalService = require('../services/contentApprovalService');
const SyllabusIntelligenceService = require('../services/syllabusIntelligenceService');

const router = express.Router();
const QUEUE_DIR = path.join(__dirname, '../generated/review_queue');
const QUARANTINE_DIR = path.join(__dirname, '../generated/quarantine');

// Admin Auth Middleware (Placeholder logic, adapt to actual auth)
function requireAdmin(req, res, next) {
    // Mock admin auth for now, in prod verify JWT/session role
    req.adminId = 'admin_system_001';
    next();
}

/**
 * GET /api/review/pending
 */
router.get('/pending', requireAdmin, (req, res) => {
    try {
        const files = fs.existsSync(QUEUE_DIR) ? fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.json')) : [];
        const batches = files.map(file => {
            const data = JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, file), 'utf8'));
            return {
                id: data.metadata.generationId,
                file,
                subject: data.metadata.subject,
                topic: data.metadata.topic,
                count: data.questions.length,
                warnings: data.metadata.warnings || [],
                createdAt: data.metadata.generatedAt
            };
        });
        res.json({ success: true, batches });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/review/quarantine
 */
router.get('/quarantine', requireAdmin, (req, res) => {
    try {
        const files = fs.existsSync(QUARANTINE_DIR) ? fs.readdirSync(QUARANTINE_DIR).filter(f => f.endsWith('.json')) : [];
        const items = files.map(file => {
            const data = JSON.parse(fs.readFileSync(path.join(QUARANTINE_DIR, file), 'utf8'));
            return {
                fingerprint: data.fingerprint,
                reason: data.rejectionReason,
                timestamp: data.timestamp,
                questionPreview: data.question?.question_en
            };
        });
        res.json({ success: true, items });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/review/batch/:id
 */
router.get('/batch/:id', requireAdmin, (req, res) => {
    try {
        const files = fs.readdirSync(QUEUE_DIR);
        const batchFile = files.find(f => f.includes(req.params.id));
        if (!batchFile) return res.status(404).json({ success: false, error: 'Batch not found' });

        const batch = JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, batchFile), 'utf8'));
        
        // Compute coverage impact
        let coverageImpact = null;
        try {
            const masterFile = path.join(__dirname, `../data/${batch.metadata.subject.toLowerCase()}.json`);
            let existingBank = [];
            if (fs.existsSync(masterFile)) {
                const rawData = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
                existingBank = Array.isArray(rawData) ? rawData : (rawData.questions || []);
            }
            
            const beforeCoverage = SyllabusIntelligenceService.validateTopicCoverage(batch.metadata.subject, existingBank);
            const afterCoverage = SyllabusIntelligenceService.validateTopicCoverage(batch.metadata.subject, [...existingBank, ...batch.questions]);
            
            coverageImpact = {
                beforeScore: beforeCoverage.coverageScore,
                afterScore: afterCoverage.coverageScore,
                delta: afterCoverage.coverageScore - beforeCoverage.coverageScore
            };
        } catch (e) {
            coverageImpact = { error: 'Could not calculate impact' };
        }

        res.json({ success: true, batch, coverageImpact });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/review/approve/:id
 */
router.post('/approve/:id', requireAdmin, async (req, res) => {
    try {
        const files = fs.readdirSync(QUEUE_DIR);
        const batchFile = files.find(f => f.includes(req.params.id));
        if (!batchFile) return res.status(404).json({ success: false, error: 'Batch not found' });

        const queuePath = path.join(QUEUE_DIR, batchFile);
        const batch = JSON.parse(fs.readFileSync(queuePath, 'utf8'));

        const result = await ContentApprovalService.executeApprovalPipeline(req.params.id, batch, req.adminId);
        
        if (result.success) {
            // Delete from queue only on full success
            fs.unlinkSync(queuePath);
            res.json({ success: true, result });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/review/reject/:id
 */
router.post('/reject/:id', requireAdmin, (req, res) => {
    try {
        const files = fs.readdirSync(QUEUE_DIR);
        const batchFile = files.find(f => f.includes(req.params.id));
        if (!batchFile) return res.status(404).json({ success: false, error: 'Batch not found' });

        const batch = JSON.parse(fs.readFileSync(path.join(QUEUE_DIR, batchFile), 'utf8'));
        
        batch.questions.forEach(q => {
            ReviewQueueService.moveToQuarantine(q, req.body.reason || 'Manual Admin Rejection');
        });

        fs.unlinkSync(path.join(QUEUE_DIR, batchFile));
        ContentApprovalService.logTrace({
            action: 'REJECT_BATCH',
            adminId: req.adminId,
            batchId: req.params.id,
            timestamp: new Date().toISOString(),
            justification: req.body.reason || 'Manual Admin Rejection'
        });

        res.json({ success: true, rejectedCount: batch.questions.length });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/review/recover/:id
 */
router.post('/recover/:id', requireAdmin, (req, res) => {
    try {
        if (!req.body.justification) return res.status(400).json({ success: false, error: 'Justification required for recovery' });

        const qFile = path.join(QUARANTINE_DIR, `quarantine_${req.params.id}.json`);
        if (!fs.existsSync(qFile)) return res.status(404).json({ success: false, error: 'Quarantined item not found' });

        const data = JSON.parse(fs.readFileSync(qFile, 'utf8'));
        
        // Re-queue the recovered question as a new single-item batch
        const batchId = crypto.randomUUID();
        const batch = {
            metadata: {
                generationId: batchId,
                subject: data.question.subject,
                topic: data.question.topic,
                warnings: ['Recovered from Quarantine']
            },
            questions: [data.question]
        };

        ReviewQueueService.enqueueForReview(batch);
        fs.unlinkSync(qFile);

        ContentApprovalService.logTrace({
            action: 'RECOVER_QUARANTINE',
            adminId: req.adminId,
            fingerprint: req.params.id,
            timestamp: new Date().toISOString(),
            justification: req.body.justification
        });

        res.json({ success: true, newBatchId: batchId });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * GET /api/review/analytics
 */
router.get('/analytics', requireAdmin, (req, res) => {
    try {
        const stats = ReviewQueueService.auditReviewQueue();
        
        // Parse trace log for rates
        let approvalCount = 0;
        let rejectCount = 0;
        const traceFile = path.join(__dirname, '../logs/review_admin_trace.json');
        if (fs.existsSync(traceFile)) {
            const lines = fs.readFileSync(traceFile, 'utf8').split('\n').filter(l => l);
            lines.forEach(l => {
                const entry = JSON.parse(l);
                if (entry.action === 'APPROVAL_SUCCESS') approvalCount++;
                if (entry.action === 'REJECT_BATCH') rejectCount++;
            });
        }

        res.json({
            success: true,
            analytics: {
                ...stats,
                approvalRate: approvalCount + rejectCount > 0 ? (approvalCount / (approvalCount + rejectCount)) * 100 : 0,
                generationVolume: 'Check trace logs'
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
