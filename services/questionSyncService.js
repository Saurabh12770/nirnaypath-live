/**
 * Question Sync Service for NirnayPath
 * Phase 6 - Elimination of JSON/DB Drift
 */

const fs = require('fs');
const path = require('path');
const Question = require('../models/Question');

const DATA_DIR = path.join(__dirname, '../data');
const BACKUP_DIR = path.join(__dirname, '../backups/repository_snapshots');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

class QuestionSyncService {

    /**
     * 1. syncMongoToJSON()
     * Writes all Mongo questions for a subject to its respective JSON file.
     */
    static async syncMongoToJSON(subject) {
        try {
            const questions = await Question.find({ 
                $or: [
                    { subject: subject.toLowerCase() },
                    { subjectId: subject.toLowerCase() }
                ]
            }).lean();

            const masterFile = path.join(DATA_DIR, `${subject.toLowerCase()}.json`);
            const tempFile = `${masterFile}.sync.tmp`;

            fs.writeFileSync(tempFile, JSON.stringify(questions, null, 2));
            fs.renameSync(tempFile, masterFile);

            return { success: true, count: questions.length };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /**
     * 2. syncJSONToMongo()
     * Upserts all JSON questions into Mongo for a subject.
     */
    static async syncJSONToMongo(subject) {
        try {
            const masterFile = path.join(DATA_DIR, `${subject.toLowerCase()}.json`);
            if (!fs.existsSync(masterFile)) return { success: false, error: 'JSON not found' };

            const rawData = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
            const questions = Array.isArray(rawData) ? rawData : (rawData.questions || []);

            let inserted = 0;
            for (const q of questions) {
                // Determine ID carefully
                const qId = q.id || q._id;
                delete q._id; // Prevent Mongo immutable _id error on upsert
                
                if (qId) {
                    await Question.updateOne(
                        { $or: [{ _id: qId }, { id: qId }] },
                        { $set: q },
                        { upsert: true }
                    );
                    inserted++;
                }
            }

            return { success: true, count: inserted };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /**
     * Helper for QuestionRepository append
     */
    static async safeAppend(subject, uniqueQuestions) {
        // 1. Atomic JSON Append
        const masterFile = path.join(DATA_DIR, `${subject.toLowerCase()}.json`);
        let existingBank = [];
        if (fs.existsSync(masterFile)) {
            const rawData = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
            existingBank = Array.isArray(rawData) ? rawData : (rawData.questions || []);
        }

        existingBank.push(...uniqueQuestions);

        const tempFile = `${masterFile}.atomic.tmp`;
        try {
            fs.writeFileSync(tempFile, JSON.stringify(existingBank, null, 2));
            fs.renameSync(tempFile, masterFile); 
        } catch (e) {
            return { success: false, error: 'JSON Sync Failed: ' + e.message };
        }

        // 2. Mongo Append
        let inserted = 0;
        for (const q of uniqueQuestions) {
            try {
                const qId = q.id || q._id;
                const copy = { ...q };
                delete copy._id;
                
                if (qId) {
                    await Question.updateOne(
                        { $or: [{ _id: qId }, { id: qId }] },
                        { $set: copy },
                        { upsert: true }
                    );
                    inserted++;
                }
            } catch (e) {
                console.error('Mongo Append Sync Error:', e.message);
            }
        }

        return { success: true, count: inserted };
    }

    /**
     * 3. verifySyncIntegrity()
     */
    static async verifySyncIntegrity() {
        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
        const report = {
            totalMismatch: 0,
            subjects: {}
        };

        for (const file of files) {
            const subject = file.replace('.json', '');
            
            // Read JSON
            const rawData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
            const jsonQuestions = Array.isArray(rawData) ? rawData : (rawData.questions || []);
            const jsonCount = jsonQuestions.length;

            // Read Mongo
            const mongoCount = await Question.countDocuments({ 
                $or: [{ subject: subject }, { subjectId: subject }]
            });

            const diff = Math.abs(jsonCount - mongoCount);
            if (diff > 0) report.totalMismatch++;

            report.subjects[subject] = { jsonCount, mongoCount, diff };
        }

        return report;
    }

    /**
     * 4. resolveConflict(conflict)
     */
    static resolveConflict(conflict) {
        // In a real DB scenario, we would use updatedAt
        // For this architecture, we consider JSON the master fallback.
        return conflict;
    }

    /**
     * 5. createRepositorySnapshot()
     */
    static createRepositorySnapshot() {
        const snapshotId = `snapshot_${Date.now()}`;
        const snapshotDir = path.join(BACKUP_DIR, snapshotId);
        fs.mkdirSync(snapshotDir, { recursive: true });

        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
        for (const file of files) {
            fs.copyFileSync(path.join(DATA_DIR, file), path.join(snapshotDir, file));
        }

        return snapshotId;
    }
}

module.exports = QuestionSyncService;
