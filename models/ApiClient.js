const mongoose = require('mongoose');

const apiClientSchema = new mongoose.Schema({
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
    appName: { type: String, required: true },
    apiKeyHash: { type: String, required: true }, // Store only hash
    rateLimit: { type: Number, default: 100 }, // requests per minute
    scopes: [{ type: String, enum: ['read:exams', 'write:results', 'read:telemetry', 'write:marketplace'] }],
    webhookUrl: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    lastAccessedAt: { type: Date }
});

apiClientSchema.index({ apiKeyHash: 1 });

module.exports = mongoose.model('ApiClient', apiClientSchema);
