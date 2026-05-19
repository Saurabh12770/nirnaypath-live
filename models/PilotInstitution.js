const mongoose = require('mongoose');

const pilotInstitutionSchema = new mongoose.Schema({
    institutionId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    tier: { type: String, enum: ['TIER_1', 'TIER_2', 'TIER_3'], required: true },
    contactEmail: { type: String, required: true },
    maxUsers: { type: Number, required: true },
    status: {
        type: String,
        enum: ['ONBOARDING', 'ACTIVE', 'NEEDS_OPTIMIZATION', 'READY_FOR_PRODUCTION', 'SUSPENDED'],
        default: 'ONBOARDING'
    },
    metrics: [{
        timestamp: Date,
        activeExams: Number,
        concurrentUsers: Number,
        incidents: Number,
        supportTickets: Number,
        fraudFlags: Number,
        avgLatencyMs: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('PilotInstitution', pilotInstitutionSchema);
