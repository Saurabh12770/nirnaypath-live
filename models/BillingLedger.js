const mongoose = require('mongoose');
const crypto = require('crypto');

const billingLedgerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' }, // Support B2B Multi-Tenant
    transactionId: { type: String, required: true, unique: true },
    planId: { type: String, required: true },
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 }, // GST amount
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    gstNumber: { type: String }, // For Institutional B2B
    invoiceId: { type: String },
    invoiceUrl: { type: String },
    status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    billingCycleStart: { type: Date },
    billingCycleEnd: { type: Date },
    retryCount: { type: Number, default: 0 },
    integrityHash: { type: String }, // Hashing critical fields for forensic defensibility
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// SRE / Scale: Indexing
billingLedgerSchema.index({ userId: 1, createdAt: -1 });
billingLedgerSchema.index({ institutionId: 1, createdAt: -1 });
billingLedgerSchema.index({ status: 1 });

// Pre-save hook to generate integrity hash for legal defensibility
billingLedgerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Ledger integrity hashing for forensic defensibility - immutable state verification
    if (this.status === 'success' && !this.integrityHash) {
        const payload = `${this.transactionId}|${this.amount}|${this.status}|${this.userId || this.institutionId}|${this.createdAt.toISOString()}`;
        this.integrityHash = crypto.createHmac('sha256', process.env.LEDGER_SECRET || 'nirnaypath_ledger_fallback_secret')
            .update(payload)
            .digest('hex');
    }
    next();
});

module.exports = mongoose.model('BillingLedger', billingLedgerSchema);
