const fs = require('fs').promises;
const rawFs = require('fs');
const path = require('path');
const crypto = require('crypto');
const QuestionContentSchema = require('../schemas/questionContentSchema');
const SemanticFirewallService = require('./semanticFirewallService');
// Assume we have access to the main JSON banks to append approved batches
const DATA_DIR = path.join(__dirname, '../data');
const QUEUE_DIR = path.join(__dirname, '../generated/review_queue');
const QUARANTINE_DIR = path.join(__dirname, '../generated/quarantine');

async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (e) {
        console.warn('[SRE_WARNING] Failed to create directory safely:', e.message);
    }
}

class ReviewQueueService {
    /**
     * Helper to read JSON safely
     */
    static async safeReadJson(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }

    /**
     * 1. Enqueue For Review
     */
    static async enqueueForReview(batch) {
        if (!batch.questions || batch.questions.length === 0) return null;
        
        const generationId = batch.metadata?.generationId || crypto.randomUUID();
        const subject = batch.metadata?.subject || 'general';
        const queueFile = path.join(QUEUE_DIR, `${subject}_${generationId}.json`);

        const payload = {
            metadata: {
                generationId,
                subject,
                createdAt: new Date().toISOString(),
                questionCount: batch.questions.length,
                qualityMetrics: batch.metadata?.metrics || {}
            },
            questions: batch.questions
        };

        await ensureDir(QUEUE_DIR);
        await fs.writeFile(queueFile, JSON.stringify(payload, null, 2));
        return generationId;
    }

    /**
     * 2. Move to Quarantine
     */
    static async moveToQuarantine(question, reason) {
        const fingerprint = SemanticFirewallService.generateSemanticFingerprint(question);
        const quarantineFile = path.join(QUARANTINE_DIR, `quarantine_${fingerprint}.json`);

        const payload = {
            timestamp: new Date().toISOString(),
            rejectionReason: reason,
            fingerprint,
            question
        };

        await ensureDir(QUARANTINE_DIR);
        await fs.writeFile(quarantineFile, JSON.stringify(payload, null, 2));
        return fingerprint;
    }

    /**
     * 3. Approve Batch
     */
    static async approveBatch(batchId, subject) {
        const queueFile = path.join(QUEUE_DIR, `${subject}_${batchId}.json`);
        const batch = await this.safeReadJson(queueFile);

        if (!batch) {
            throw new Error('Batch not found');
        }

        // Load existing master bank for the subject
        const masterFile = path.join(DATA_DIR, `${subject.toLowerCase()}.json`);
        let existingBank = await this.safeReadJson(masterFile);
        if (!existingBank) existingBank = { questions: [] };
        if (Array.isArray(existingBank)) existingBank = { questions: existingBank };

        const approvedQuestions = [];

        for (const q of batch.questions) {
            // Validate Schema AGAIN
            const validation = QuestionContentSchema.validateQuestionStructure(q);
            if (!validation.valid) {
                await this.moveToQuarantine(q, `Failed final schema validation: ${validation.errors.join(', ')}`);
                continue;
            }

            // Validate Semantic Firewall AGAIN
            const duplicateCheck = SemanticFirewallService.detectSemanticDuplicate(validation.normalizedQuestion, existingBank.questions);
            if (duplicateCheck.duplicate) {
                await this.moveToQuarantine(validation.normalizedQuestion, `Failed final semantic duplicate check: ${duplicateCheck.reasons.join(', ')}`);
                continue;
            }

            approvedQuestions.push(validation.normalizedQuestion);
        }

        // Validate Diversity AGAIN (on the approved subset)
        const diversityCheck = SemanticFirewallService.enforceQuestionDiversity(approvedQuestions);
        if (!diversityCheck.passed) {
            // We reject the entire approved subset if it fails diversity at the final stage
            for (const q of approvedQuestions) {
                await this.moveToQuarantine(q, `Batch failed final diversity check: ${diversityCheck.warnings.join(', ')}`);
            }
            await fs.unlink(queueFile);
            throw new Error(`Batch rejected due to diversity violations: ${diversityCheck.warnings.join(', ')}`);
        }

        // Append safely
        if (approvedQuestions.length > 0) {
            existingBank.questions.push(...approvedQuestions);
            await fs.writeFile(masterFile, JSON.stringify(existingBank.questions, null, 2)); // Save as raw array if that's the format
        }

        // Delete from queue
        await fs.unlink(queueFile);

        return {
            success: true,
            approvedCount: approvedQuestions.length,
            rejectedCount: batch.questions.length - approvedQuestions.length
        };
    }

    /**
     * 4. Reject Batch
     */
    static async rejectBatch(batchId, subject) {
        const queueFile = path.join(QUEUE_DIR, `${subject}_${batchId}.json`);
        const batch = await this.safeReadJson(queueFile);

        if (!batch) {
            throw new Error('Batch not found');
        }

        // Move all to quarantine
        for (const q of batch.questions) {
            await this.moveToQuarantine(q, 'Batch manually rejected by admin');
        }

        // Delete from queue
        await fs.unlink(queueFile);

        return { success: true, rejectedCount: batch.questions.length };
    }

    /**
     * 5. Audit Review Queue
     */
    static async auditReviewQueue() {
        let queueFiles = [];
        try {
            queueFiles = rawFs.existsSync(QUEUE_DIR) ? await fs.readdir(QUEUE_DIR) : [];
            queueFiles = queueFiles.filter(f => f.endsWith('.json'));
        } catch (e) {
            console.warn('[SRE_WARNING] Failed to read queue directory:', e.message);
        }

        let quarantineFiles = [];
        try {
            quarantineFiles = rawFs.existsSync(QUARANTINE_DIR) ? await fs.readdir(QUARANTINE_DIR) : [];
            quarantineFiles = quarantineFiles.filter(f => f.endsWith('.json'));
        } catch (e) {
            console.warn('[SRE_WARNING] Failed to read quarantine directory:', e.message);
        }

        let pendingBatches = queueFiles.length;
        let quarantineSize = quarantineFiles.length;
        let totalPendingQuestions = 0;

        for (const file of queueFiles) {
            const batch = await this.safeReadJson(path.join(QUEUE_DIR, file));
            if (batch) totalPendingQuestions += (batch.questions || []).length;
        }

        return {
            pendingBatches,
            totalPendingQuestions,
            quarantineSize,
            approvalRatios: 'Calculated via DB metrics in future implementation'
        };
    }
}

module.exports = ReviewQueueService;
