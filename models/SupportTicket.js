const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    ticketId: { type: String, required: true, unique: true, index: true },
    type: { 
        type: String, 
        enum: ['CANDIDATE_ISSUE', 'CENTER_ISSUE', 'PAYMENT_ISSUE', 'FRAUD_DISPUTE', 'TECHNICAL_ISSUE', 'APPEAL', 'ACCESSIBILITY_REQUEST'],
        required: true 
    },
    status: {
        type: String,
        enum: ['NEW', 'OPEN', 'IN_PROGRESS', 'ESCALATED', 'PENDING_EVIDENCE', 'RESOLVED', 'CLOSED'],
        default: 'NEW'
    },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    
    submitter: {
        userId: { type: String, required: true },
        role: { type: String, required: true }, // Candidate, CenterAdmin, InstitutionalAdmin
        contactInfo: String
    },
    
    subject: { type: String, required: true },
    description: { type: String, required: true },
    
    examContext: {
        examId: String,
        centerId: String
    },
    
    evidence: [{
        url: String, // Path to attached image/doc
        uploadedAt: { type: Date, default: Date.now }
    }],
    
    timeline: [{
        action: String,
        actorId: String,
        note: String,
        timestamp: { type: Date, default: Date.now },
        isInternal: { type: Boolean, default: false } // Internal notes hidden from submitter
    }],

    sla: {
        targetResolutionTime: Date,
        breached: { type: Boolean, default: false }
    },
    
    assignedTo: String, // Admin User ID
    resolvedAt: Date,
    resolutionSummary: String
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
