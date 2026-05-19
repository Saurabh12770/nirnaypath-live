const crypto = require('crypto');
const FeatureFlags = require('../config/featureFlags');

/**
 * Immutable append-only architecture
 * SHA-256 forensic chaining
 */
class NationalAuditLedger {
    constructor() {
        this.lastHash = null; // In DB this would be tracked to form a blockchain-like chain
    }

    async appendRecord(actor, actionType, payload) {
        if (!FeatureFlags.isEnabled('ENABLE_NATIONAL_AUDIT_LEDGER')) return;

        const timestamp = new Date().toISOString();
        const rawData = `${actor}|${actionType}|${JSON.stringify(payload)}|${timestamp}|${this.lastHash || 'GENESIS'}`;
        
        const hash = crypto.createHmac('sha256', process.env.NATIONAL_AUDIT_SECRET || 'audit_sec')
                           .update(rawData)
                           .digest('hex');

        const record = {
            auditId: crypto.randomUUID(),
            actor,
            actionType, // e.g., 'DEPLOYMENT_FROZEN', 'EXAM_OVERRIDE', 'PAYOUT_HELD'
            payload,
            timestamp,
            previousHash: this.lastHash,
            hash
        };

        // Write to DB asynchronously
        // ... DB Write Logic ...

        this.lastHash = hash;
        console.log(`[NATIONAL AUDIT] Appended Record: ${record.auditId} | Hash: ${hash}`);
        return record;
    }
}
module.exports = new NationalAuditLedger();
