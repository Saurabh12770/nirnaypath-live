const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment
dotenv.config();

// Import services (Must be done carefully to avoid circular refs)
const { sendEmail } = require('../services/emailService');
const { connection } = require('../services/queueService');

const DLQ_PATH = path.join(__dirname, '../logs/email_dead_letter.jsonl');
const TEMP_PATH = DLQ_PATH + '.tmp';

async function replayDLQ() {
    console.log(`[${new Date().toISOString()}] Starting DLQ Replay...`);
    
    // 1. Connection Pre-flight Check
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath');
        console.log(' - MongoDB connected');
        
        // Ping Redis to ensure it's healthy
        const pong = await connection.ping();
        if (pong !== 'PONG') throw new Error('Redis ping failed');
        console.log(' - Redis/BullMQ connection healthy');
    } catch (err) {
        console.error('CRITICAL: Infrastructure unavailable for replay. Aborting.');
        console.error(err.message);
        process.exit(1);
    }

    if (!fs.existsSync(DLQ_PATH)) {
        console.log(' - No DLQ file found. Nothing to replay.');
        process.exit(0);
    }

    const stats = {
        totalRead: 0,
        totalQueued: 0,
        totalSkipped: 0,
        totalMalformed: 0,
        totalFailed: 0
    };

    const fileStream = fs.createReadStream(DLQ_PATH);
    const tempStream = fs.createWriteStream(TEMP_PATH);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        if (!line.trim()) continue;
        stats.totalRead++;

        let record;
        try {
            record = JSON.parse(line);
        } catch (err) {
            stats.totalMalformed++;
            tempStream.write(line + '\n');
            continue;
        }

        // 2. Idempotency Check (SKIP if already replayed)
        if (record.replayedAt) {
            stats.totalSkipped++;
            tempStream.write(line + '\n');
            continue;
        }

        // 3. Replay Operation
        try {
            const replayId = crypto.randomUUID();
            
            // We use sendEmail because it regenerates the HTML and subject 
            // ensuring consistency with the current codebase.
            // We also inject the replay metadata which will be captured by BullMQ.
            
            // Note: sendEmail internally calls addEmailJob.
            // To prevent addEmailJob from logging to DLQ again during THIS replay
            // we could wrap it, but sendEmail is already robust.
            
            await sendEmail(record.type, {
                ...record.payload,
                _replayContext: {
                    replayId,
                    replaySource: 'DLQ_RECOVERY',
                    originalTimestamp: record.timestamp,
                    replayCount: (record.replayCount || 0) + 1
                }
            });

            // Mark record as replayed for the updated file
            record.replayedAt = new Date().toISOString();
            record.replayId = replayId;
            record.replaySource = 'DLQ_RECOVERY';
            record.replayCount = (record.replayCount || 0) + 1;
            
            stats.totalQueued++;
            tempStream.write(JSON.stringify(record) + '\n');
        } catch (err) {
            stats.totalFailed++;
            console.error(`Failed to replay record for ${record.recipient}:`, err.message);
            // Write back without replayedAt so it can be retried later
            tempStream.write(line + '\n');
        }
    }

    tempStream.end();

    // 4. Atomic Swap (Safety Hardening)
    return new Promise((resolve, reject) => {
        tempStream.on('finish', () => {
            try {
                // Rename temp to original to commit the "replayed" markers
                fs.renameSync(TEMP_PATH, DLQ_PATH);
                console.log('\n--- Replay Summary ---');
                console.table(stats);
                console.log(`[${new Date().toISOString()}] Replay Finished Successfully.`);
                resolve();
            } catch (err) {
                console.error('Failed to commit DLQ updates:', err.message);
                reject(err);
            }
        });
    });
}

// Global Error Handling
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});

replayDLQ().then(() => {
    mongoose.connection.close();
    process.exit(0);
}).catch(err => {
    console.error('Fatal Replay Error:', err);
    process.exit(1);
});
