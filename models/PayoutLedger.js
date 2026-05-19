const mongoose = require('mongoose');
const crypto = require('crypto');

const payoutLedgerSchema = new mongoose.Schema({
    payeeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    payeeType: { type: String, enum: ['institution', 'educator'], required: true },
    transactionId: { type: String, required: true, unique: true },
    relatedListingId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceListing' },
    grossAmount: { type: Number, required: true },
    platformCommission: { type: Number, required: true },
    taxWithheld: { type: Number, default: 0 }, // TDS
    netPayout: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'processing', 'settled', 'held', 'failed'], default: 'pending' },
    settlementDate: { type: Date },
    razorpayPayoutId: { type: String },
    immutableHash: { type: String }, // Cryptographic defensibility
    createdAt: { type: Date, default: Date.now }
});

payoutLedgerSchema.pre('save', function(next) {
    if (this.status === 'settled' && !this.immutableHash) {
        const payload = `${this.transactionId}|${this.netPayout}|${this.status}|${this.payeeId}|${this.createdAt.toISOString()}`;
        this.immutableHash = crypto.createHmac('sha256', process.env.LEDGER_SECRET || 'fallback').update(payload).digest('hex');
    }
    next();
});

module.exports = mongoose.model('PayoutLedger', payoutLedgerSchema);
