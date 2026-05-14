/**
 * Content Approval Service for NirnayPath
 * Phase 5 - Admin Review Dashboard
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const QuestionContentSchema = require('../schemas/questionContentSchema');
const SemanticFirewallService = require('./semanticFirewallService');
const Question = require('../models/question'); // Mongoose Model

const DATA_DIR = path.join(__dirname, '../data');
const BACKUP_DIR = path.join(__dirname, '../backups/question_banks');
const LOGS_DIR = path.join(__dirname, '../logs');

// Ensure backups dir exists
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

class ContentApprovalService {
    static logTrace(entry) {
        try {
            const traceFile = path.join(LOGS_DIR, 'review_admin_trace.json');
            fs.appendFileSync(traceFile, JSON.stringify(entry) + '\n');
        } catch (e) {
            console.error('[ContentApprovalService] Trace Write Error:', e.message);
        }
    }

    /**
     * 1. Safely Approve Questions
     */
    static safelyApproveQuestions(batch) {
        if (!batch || !batch.questions || batch.questions.length === 0) {
            return { success: false, error: 'Empty batch', approvedQuestions: [] };
        }

        const subject = batch.metadata?.subject || 'unknown';
        const masterFile = path.join(DATA_DIR, `${subject.toLowerCase()}.json`);
        
        let existingBank = [];
        if (fs.existsSync(masterFile)) {
            try {
                const rawData = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
                existingBank = Array.isArray(rawData) ? rawData : (rawData.questions || []);
            } catch (e) {
                return { success: false, error: 'Corrupt master JSON file', approvedQuestions: [] };
            }
        }

        const approvedQuestions = [];
        const rejectionReasons = [];

        for (const q of batch.questions) {
            // Re-run schema validation
            const validation = QuestionContentSchema.validateQuestionStructure(q);
            if (!validation.valid) {
                rejectionReasons.push(`ID ${q.id}: Schema Invalid - ${validation.errors.join(', ')}`);
                continue;
            }

            // Re-run semantic firewall against master bank + newly approved in this batch
            const checkBank = [...existingBank, ...approvedQuestions];
            const duplicateCheck = SemanticFirewallService.detectSemanticDuplicate(validation.normalizedQuestion, checkBank);
            if (duplicateCheck.duplicate) {
                rejectionReasons.push(`ID ${q.id}: Semantic Duplicate - ${duplicateCheck.reasons.join(', ')}`);
                continue;
            }

            approvedQuestions.push(validation.normalizedQuestion);
        }

        // Final diversity check
        if (approvedQuestions.length > 0) {
            const diversityCheck = SemanticFirewallService.enforceQuestionDiversity(approvedQuestions);
            if (!diversityCheck.passed) {
                return { success: false, error: `Batch Diversity Failed: ${diversityCheck.warnings.join(', ')}`, approvedQuestions: [] };
            }
        } else {
            return { success: false, error: `All questions rejected. Reasons: ${rejectionReasons.join(' | ')}`, approvedQuestions: [] };
        }

        return { success: true, approvedQuestions, rejectionReasons };
    }

    /**
     * 4. Create Approval Backup
     */
    static createApprovalBackup(subject) {
        const masterFile = path.join(DATA_DIR, `${subject.toLowerCase()}.json`);
        if (!fs.existsSync(masterFile)) return null;

        const backupId = `${subject.toLowerCase()}-${Date.now()}-backup.json`;
        const backupFile = path.join(BACKUP_DIR, backupId);

        fs.copyFileSync(masterFile, backupFile);
        return backupId;
    }

    /**
     * 5. Rollback Approval
     */
    static rollbackApproval(backupId) {
        const backupFile = path.join(BACKUP_DIR, backupId);
        if (!fs.existsSync(backupFile)) {
            return { success: false, error: 'Backup not found' };
        }

        const subject = backupId.split('-')[0];
        const masterFile = path.join(DATA_DIR, `${subject}.json`);

        try {
            // Atomic swap
            const tempFile = `${masterFile}.tmp`;
            fs.copyFileSync(backupFile, tempFile);
            fs.renameSync(tempFile, masterFile);
            
            this.logTrace({
                action: 'ROLLBACK_SUCCESS',
                backupId,
                timestamp: new Date().toISOString()
            });

            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /**
     * 2. Atomic Append To Bank
     */
    static atomicAppendToBank(subject, questions) {
        const masterFile = path.join(DATA_DIR, `${subject.toLowerCase()}.json`);
        
        let existingBank = [];
        if (fs.existsSync(masterFile)) {
            const rawData = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
            existingBank = Array.isArray(rawData) ? rawData : (rawData.questions || []);
        }

        existingBank.push(...questions);

        const tempFile = `${masterFile}.atomic.tmp`;
        try {
            fs.writeFileSync(tempFile, JSON.stringify(existingBank, null, 2));
            fs.renameSync(tempFile, masterFile); // Atomic swap
            return { success: true };
        } catch (e) {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
            return { success: false, error: e.message };
        }
    }

    /**
     * 3. Sync Approved Questions To Mongo
     */
    static async syncApprovedQuestionsToMongo(questions) {
        let insertedCount = 0;
        const failedIds = [];

        for (const q of questions) {
            try {
                await Question.updateOne(
                    { _id: q.id || q._id },
                    { $set: q },
                    { upsert: true }
                );
                insertedCount++;
            } catch (e) {
                failedIds.push(q.id || q._id);
            }
        }

        return {
            success: failedIds.length === 0,
            insertedCount,
            failedIds
        };
    }

    /**
     * Main Approval Pipeline execution
     */
    static async executeApprovalPipeline(batchId, batch, adminId) {
        try {
            const subject = batch.metadata?.subject || 'general';

            // Step 1: Safe Approval Gate
            const approvalResult = this.safelyApproveQuestions(batch);
            if (!approvalResult.success) {
                this.logTrace({ action: 'APPROVAL_FAILED', adminId, batchId, timestamp: new Date().toISOString(), justification: approvalResult.error });
                return { success: false, error: approvalResult.error };
            }

            const questions = approvalResult.approvedQuestions;

            // Step 2: Backup
            const backupId = this.createApprovalBackup(subject);

            // Step 3: Atomic Append JSON
            const appendResult = this.atomicAppendToBank(subject, questions);
            if (!appendResult.success) {
                this.logTrace({ action: 'JSON_APPEND_FAILED', adminId, batchId, timestamp: new Date().toISOString(), justification: appendResult.error });
                return { success: false, error: 'Failed atomic JSON append' };
            }

            // Step 4: Sync to Mongo
            const mongoResult = await this.syncApprovedQuestionsToMongo(questions);
            if (!mongoResult.success) {
                // Rollback JSON if Mongo sync fails to keep them perfectly in sync
                if (backupId) this.rollbackApproval(backupId);
                this.logTrace({ action: 'MONGO_SYNC_FAILED_ROLLED_BACK', adminId, batchId, timestamp: new Date().toISOString(), justification: `Mongo failures: ${mongoResult.failedIds.join(', ')}` });
                return { success: false, error: 'MongoDB sync failed, JSON rolled back' };
            }

            // Step 5: Log Success
            this.logTrace({
                action: 'APPROVAL_SUCCESS',
                adminId,
                batchId,
                timestamp: new Date().toISOString(),
                approvedCount: questions.length,
                rejectedCount: batch.questions.length - questions.length,
                justification: 'Approved via pipeline',
                rollbackId: backupId
            });

            return { success: true, approvedCount: questions.length, backupId };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = ContentApprovalService;
