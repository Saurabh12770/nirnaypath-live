/**
 * Question Reservation Manager
 * Atomic coordination service for question selection.
 */

const QuestionReservation = require('../models/questionReservation');
const mongoose = require('mongoose');

class QuestionReservationManager {
    constructor() {
        this._userLocks = new Map(); // In-memory mutex per user
    }

    /**
     * Acquire an async lock for a specific user to prevent race conditions in selection.
     * Upgraded to cluster-safe DistributedLockService for zero-trust concurrency safety.
     */
    async acquireUserLock(userId) {
        const uId = userId.toString();
        const lockKey = `lock:user_reservation:${uId}`;
        const DistributedLockService = require('./distributedLockService');

        const result = await DistributedLockService.acquireLock(lockKey, 15000, {
            retries: 30,
            retryDelayMs: 100
        });

        if (!result.success) {
            throw new Error(`Could not acquire selection lock for user ${uId}. Please retry.`);
        }

        return () => {
            DistributedLockService.releaseLock(lockKey, result.lockId)
                .catch(err => console.error(`[Reservation] Lock release failed: ${err.message}`));
        };
    }

    /**
     * Get all reserved/committed IDs for a user.
     */
    async getReservedIds(userId) {
        const resvs = await QuestionReservation.find({
            userId,
            status: { $in: ['RESERVED', 'COMMITTED'] }
        }).select('questionId').lean();
        
        return new Set(resvs.map(r => r.questionId));
    }

    /**
     * Atomically reserve a set of questions.
     * Uses MongoDB unique index to ensure no two processes can reserve the same question for the same user.
     */
    async reserveAtomically(userId, questionIds, sessionId) {
        if (!questionIds || questionIds.length === 0) return true;

        const reserved = [];
        try {
            for (const qId of questionIds) {
                try {
                    await QuestionReservation.create({
                        userId,
                        questionId: qId,
                        sessionId,
                        status: 'RESERVED',
                        timestamp: new Date()
                    });
                    reserved.push(qId);
                } catch (err) {
                    // Duplicate key error means it's already reserved
                    if (err.code === 11000) {
                        throw new Error(`Question ${qId} is already reserved.`);
                    }
                    throw err;
                }
            }
            return true;
        } catch (err) {
            console.error(`[Reservation] Atomic reservation failed: ${err.message}. Rolling back...`);
            if (reserved.length > 0) {
                await this.release(userId, reserved);
            }
            return false;
        }
    }

    /**
     * Commit reservations to permanent history (logical).
     */
    async commit(userId, questionIds) {
        await QuestionReservation.updateMany(
            { userId, questionId: { $in: questionIds }, status: 'RESERVED' },
            { $set: { status: 'COMMITTED', timestamp: new Date() } }
        );
    }

    /**
     * Release reservations (rollback or cleanup).
     */
    async release(userId, questionIds) {
        await QuestionReservation.deleteMany({
            userId,
            questionId: { $in: questionIds },
            status: 'RESERVED'
        });
    }

    /**
     * Global Invariant Check
     */
    async verifyInvariant(userId, currentQuestionIds) {
        // Check for duplicates in current set
        const set = new Set(currentQuestionIds);
        if (set.size !== currentQuestionIds.length) return false;

        // Check against other active reservations for same user
        const otherResvs = await QuestionReservation.countDocuments({
            userId,
            questionId: { $in: currentQuestionIds },
            status: { $in: ['RESERVED', 'COMMITTED'] }
        });

        // We expect exactly currentQuestionIds.length reservations (the ones we just made)
        return otherResvs <= currentQuestionIds.length;
    }
}

module.exports = new QuestionReservationManager();
