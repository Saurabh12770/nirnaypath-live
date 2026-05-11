const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const Question = require('../models/Question');

dotenv.config();

/**
 * Migration script to move questions from JSON files in /data to MongoDB.
 * This script is idempotent (uses upsert based on the unique 'id' field).
 */
const migrate = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables.');
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for migration...');

        const dataDir = path.join(__dirname, '../data');
        const files = await fs.readdir(dataDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        console.log(`Found ${jsonFiles.length} JSON files to migrate.`);

        for (const file of jsonFiles) {
            const subjectKey = file.replace('.json', '').toLowerCase();
            console.log(`\nProcessing ${file}...`);

            const content = await fs.readFile(path.join(dataDir, file), 'utf-8');
            const parsed = JSON.parse(content);
            
            // Handle different JSON structures (top-level array or { questions: [] })
            const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

            if (questions.length === 0) {
                console.log(`  Skipping empty file: ${file}`);
                continue;
            }

            console.log(`  Found ${questions.length} questions. Preparing bulk operations...`);

            const bulkOps = questions.map(q => {
                // Ensure the question has a valid ID
                if (!q.id) {
                    q.id = `GEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                }

                // Map and clean fields
                const normalizedQ = {
                    id: q.id,
                    subject: subjectKey,
                    topic: q.topic || 'General',
                    difficulty: (q.difficulty || 'medium').toLowerCase(),
                    exam_tags: q.exam_tags || [],
                    question_en: q.question_en || q.question || '',
                    question_hi: q.question_hi || '',
                    options_en: q.options_en || q.options || [],
                    options_hi: q.options_hi || [],
                    correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
                    explanation_en: q.explanation_en || q.explanation || '',
                    explanation_hi: q.explanation_hi || '',
                    reference: q.reference || '',
                    year_asked: q.year_asked || ''
                };

                return {
                    updateOne: {
                        filter: { id: normalizedQ.id },
                        update: { $set: normalizedQ },
                        upsert: true
                    }
                };
            });

            // Execute in batches to optimize performance and avoid memory limits
            const batchSize = 1000;
            for (let i = 0; i < bulkOps.length; i += batchSize) {
                const batch = bulkOps.slice(i, i + batchSize);
                await Question.bulkWrite(batch);
                console.log(`  Progress: ${Math.min(i + batchSize, bulkOps.length)}/${questions.length} migrated.`);
            }
        }

        console.log('\n✅ All migrations complete.');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Migration failed:', err);
        process.exit(1);
    }
};

migrate();
