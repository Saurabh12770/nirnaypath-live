const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Question = require('../models/question');
const DedupEngine = require('../services/dedupEngine');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nirnaypath');
        console.log('Connected to MongoDB.');

        const pool = await Question.find({}).lean();
        console.log(`Found ${pool.length} total questions in MongoDB.`);

        const duplicateGroups = new Map();
        const seenEnTexts = new Map();
        const seenHiTexts = new Map();
        
        for (const q of pool) {
            const id = q._id.toString();
            const textEn = DedupEngine.normalizeText(q.question_en || q.text || '');
            const textHi = DedupEngine.normalizeText(q.question_hi || '');

            let conflictKey = null;
            if (textEn && seenEnTexts.has(textEn)) {
                conflictKey = seenEnTexts.get(textEn);
            } else if (textHi && seenHiTexts.has(textHi)) {
                conflictKey = seenHiTexts.get(textHi);
            }

            if (conflictKey) {
                if (!duplicateGroups.has(conflictKey)) {
                    duplicateGroups.set(conflictKey, [pool.find(p => p._id.toString() === conflictKey)]);
                }
                duplicateGroups.get(conflictKey).push(q);
            } else {
                if (textEn) seenEnTexts.set(textEn, id);
                if (textHi) seenHiTexts.set(textHi, id);
            }
        }

        console.log(`Found ${duplicateGroups.size} semantic duplicate groups.`);
        
        let removedCount = 0;
        const affectedIds = [];

        for (const [canonicalId, group] of duplicateGroups.entries()) {
            // Find the best question to keep. Best = longest total length
            let bestQ = group[0];
            let maxLen = 0;
            for (const q of group) {
                const len = (q.question_en || '').length + (q.question_hi || '').length + (q.explanation_en || '').length + (q.explanation_hi || '').length;
                if (len > maxLen) {
                    maxLen = len;
                    bestQ = q;
                }
            }

            // Remove all others
            for (const q of group) {
                if (q._id.toString() !== bestQ._id.toString()) {
                    await Question.findByIdAndDelete(q._id);
                    removedCount++;
                    affectedIds.push(q._id.toString());
                }
            }
        }

        console.log(`\nCleanup Complete!`);
        console.log(`Removed ${removedCount} duplicate questions.`);
        if (affectedIds.length > 0) {
            console.log(`Affected IDs:`, affectedIds.slice(0, 10), affectedIds.length > 10 ? `...and ${affectedIds.length - 10} more` : '');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error during cleanup:', err);
        process.exit(1);
    }
}

run();
