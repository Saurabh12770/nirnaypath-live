const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateRecordSchema = new mongoose.Schema({
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: String, required: true }, // Can be generic ID or specific exam model ID
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
    score: { type: Number, required: true },
    percentile: { type: Number },
    issuedDate: { type: Date, default: Date.now },
    certificateId: { type: String, required: true, unique: true },
    cryptographicHash: { type: String, required: true }, // Tamper-proof hash
    revoked: { type: Boolean, default: false }
});

certificateRecordSchema.index({ certificateId: 1 });

module.exports = mongoose.model('CertificateRecord', certificateRecordSchema);
