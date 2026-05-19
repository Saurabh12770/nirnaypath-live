const mongoose = require('mongoose');

const fraudReviewBoardSchema = new mongoose.Schema({
    caseId: { type: String, required: true, unique: true },
    candidateId: { type: String, required: true },
    examId: { type: String, required: true },
    aiRiskScore: { type: Number, required: true },
    
    status: {
        type: String,
        enum: ['PENDING_REVIEW', 'UNDER_REVIEW', 'ESCALATED', 'CLEARED', 'DISQUALIFIED'],
        default: 'PENDING_REVIEW'
    },
    
    evidenceBundleUrl: { type: String, required: true },
    
    reviewers: [{
        adminId: String,
        vote: { type: String, enum: ['CLEAR', 'DISQUALIFY', 'ESCALATE'] },
        notes: String,
        timestamp: Date
    }],
    
    finalDecision: {
        outcome: { type: String, enum: ['CLEARED', 'DISQUALIFIED'] },
        decidedBy: String, // Typically Lead Admin
        decidedAt: Date,
        justification: String
    },
    
    appealStatus: {
        appealed: { type: Boolean, default: false },
        appealDate: Date,
        appealOutcome: String
    }
}, { timestamps: true });

module.exports = mongoose.model('FraudReviewBoard', fraudReviewBoardSchema);
