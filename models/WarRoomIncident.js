const mongoose = require('mongoose');

const incidentEvidenceSchema = new mongoose.Schema({
    type: { type: String, enum: ['LOG', 'METRIC_SNAPSHOT', 'REDIS_STATE', 'MONGO_STATE', 'USER_REPORT'], required: true },
    dataHash: { type: String, required: true }, // Immutable reference to evidence payload in object storage/S3
    timestamp: { type: Date, default: Date.now },
    description: String
}, { _id: false });

const warRoomIncidentSchema = new mongoose.Schema({
    incidentId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    severity: { 
        type: String, 
        enum: ['P0', 'P1', 'P2', 'P3'], 
        required: true 
    }, // P0 -> National, P1 -> Region, P2 -> Center, P3 -> Candidate
    status: {
        type: String,
        enum: ['OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED', 'CLOSED'],
        default: 'OPEN'
    },
    scope: {
        examId: { type: String },
        region: { type: String },
        centerId: { type: String },
        candidateId: { type: String }
    },
    timeline: [{
        action: { type: String, required: true },
        adminId: { type: String, required: true },
        reason: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        telemetrySnapshot: { type: mongoose.Schema.Types.Mixed }
    }],
    evidence: [incidentEvidenceSchema],
    impactedUsers: { type: Number, default: 0 },
    openedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('WarRoomIncident', warRoomIncidentSchema);
