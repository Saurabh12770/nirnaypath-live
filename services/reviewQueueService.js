/**
 * Review Queue Service for NirnayPath
 * Phase 4 - Build Semantic Duplicate Firewall + Human Review Pipeline
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const QuestionContentSchema = require('../schemas/questionContentSchema');
const SemanticFirewallService = require('./semanticFirewallService');
// Assume we have access to the main JSON banks to append approved batches
const DATA_DIR = path.join(__dirname, '../data');
const QUEUE_DIR = path.join(__dirname, '../generated/review_queue');
const QUARANTINE_DIR = path.join(__dirname, '../generated/quarantine');

if (!fs.existsSync(QUEUE_DIR)) fs.mkdirSync(QUEUE_DIR, { recursive: true });
if (!fs.existsSync(QUARANTINE_DIR)) fs.mkdirSync(QUARANTINE_DIR, { recursive: true });

class ReviewQueueService {
    /**
     * Helper to read JSON safely
     */
    static safeReadJson(filePath) {
        if (!fs.existsSync(filePath)) return null;
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error(`Error parsing JSON: ${filePath}`, e);
            return null;
        }
    }

    /**
     * 1. Enqueue For Review
     */
    static enqueueForReview(batch) {
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

        fs.writeFileSync(queueFile, JSON.stringify(payload, null, 2));
        return generationId;
    }

    /**
     * 2. Move to Quarantine
     */
    static moveToQuarantine(question, reason) {
        const fingerprint = SemanticFirewallService.generateSemanticFingerprint(question);
        const quarantineFile = path.join(QUARANTINE_DIR, `quarantine_${fingerprint}.json`);

        const payload = {
            timestamp: new Date().toISOString(),
            rejectionReason: reason,
            fingerprint,
            question
        };

        fs.writeFileSync(quarantineFile, JSON.stringify(payload, null, 2));
        return fingerprint;
    }

    /**
     * 3. Approve Batch
     */
    static approveBatch(batchId, subject) {
        const queueFile = path.join(QUEUE_DIR, `${subject}_${batchId}.json`);
        const batch = this.safeReadJson(queueFile);

        if (!batch) {
            throw new Error('Batch not found');
        }

        // Load existing master bank for the subject
        const masterFile = path.join(DATA_DIR, `${subject.toLowerCase()}.json`);
        let existingBank = this.safeReadJson(masterFile);
        if (!existingBank) existingBank = { questions: [] };
        if (Array.isArray(existingBank)) existingBank = { questions: existingBank };

        const approvedQuestions = [];

        for (const q of batch.questions) {
            // Validate Schema AGAIN
            const validation = QuestionContentSchema.validateQuestionStructure(q);
            if (!validation.valid) {
                this.moveToQuarantine(q, `Failed final schema validation: ${validation.errors.join(', ')}`);
                continue;
            }

            // Validate Semantic Firewall AGAIN
            const duplicateCheck = SemanticFirewallService.detectSemanticDuplicate(validation.normalizedQuestion, existingBank.questions);
            if (duplicateCheck.duplicate) {
                this.moveToQuarantine(validation.normalizedQuestion, `Failed final semantic duplicate check: ${duplicateCheck.reasons.join(', ')}`);
                continue;
            }

            approvedQuestions.push(validation.normalizedQuestion);
        }

        // Validate Diversity AGAIN (on the approved subset)
        const diversityCheck = SemanticFirewallService.enforceQuestionDiversity(approvedQuestions);
        if (!diversityCheck.passed) {
            // We reject the entire approved subset if it fails diversity at the final stage
            approvedQuestions.forEach(q => this.moveToQuarantine(q, `Batch failed final diversity check: ${diversityCheck.warnings.join(', ')}`));
            fs.unlinkSync(queueFile);
            throw new Error(`Batch rejected due to diversity violations: ${diversityCheck.warnings.join(', ')}`);
        }

        // Append safely
        if (approvedQuestions.length > 0) {
            existingBank.questions.push(...approvedQuestions);
            fs.writeFileSync(masterFile, JSON.stringify(existingBank.questions, null, 2)); // Save as raw array if that's the format
        }

        // Delete from queue
        fs.unlinkSync(queueFile);

        return {
            success: true,
            approvedCount: approvedQuestions.length,
            rejectedCount: batch.questions.length - approvedQuestions.length
        };
    }

    /**
     * 4. Reject Batch
     */
    static rejectBatch(batchId, subject) {
        const queueFile = path.join(QUEUE_DIR, `${subject}_${batchId}.json`);
        const batch = this.safeReadJson(queueFile);

        if (!batch) {
            throw new Error('Batch not found');
        }

        // Move all to quarantine
        batch.questions.forEach(q => {
            this.moveToQuarantine(q, 'Batch manually rejected by admin');
        });

        // Delete from queue
        fs.unlinkSync(queueFile);

        return { success: true, rejectedCount: batch.questions.length };
    }

    /**
     * 5. Audit Review Queue
     */
    static auditReviewQueue() {
        const queueFiles = fs.existsSync(QUEUE_DIR) ? fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.json')) : [];
        const quarantineFiles = fs.existsSync(QUARANTINE_DIR) ? fs.readdirSync(QUARANTINE_DIR).filter(f => f.endsWith('.json')) : [];

        let pendingBatches = queueFiles.length;
        let quarantineSize = quarantineFiles.length;
        let totalPendingQuestions = 0;

        for (const file of queueFiles) {
            const batch = this.safeReadJson(path.join(QUEUE_DIR, file));
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
