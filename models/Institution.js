const mongoose = require('mongoose');

const InstitutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['university', 'coaching', 'government', 'recruitment_agency'],
    required: true
  },
  adminUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  config: {
    dataIsolationLevel: { type: String, enum: ['strict', 'shared'], default: 'strict' },
    allowedRegions: [{ type: String }],
    maxConcurrentCandidates: { type: Number, default: 1000 },
    customBranding: { type: Boolean, default: false }
  },
  compliance: {
    dataRetentionDays: { type: Number, default: 365 },
    requiresGDPR: { type: Boolean, default: false }
  },
  status: { type: String, enum: ['active', 'suspended', 'archived'], default: 'active' }
}, { timestamps: true });

InstitutionSchema.index({ code: 1 });
InstitutionSchema.index({ type: 1 });

module.exports = mongoose.model('Institution', InstitutionSchema);
