const mongoose = require('mongoose');

const educatorProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isVerified: { type: Boolean, default: false },
    trustScore: { type: Number, default: 50 }, // 0-100
    subjectExpertise: [String],
    totalEarnings: { type: Number, default: 0 },
    activeListingsCount: { type: Number, default: 0 },
    reputationTier: { type: String, enum: ['new', 'trusted', 'top_rated', 'suspended'], default: 'new' },
    kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

educatorProfileSchema.index({ trustScore: -1 });
educatorProfileSchema.index({ isVerified: 1 });

module.exports = mongoose.model('EducatorProfile', educatorProfileSchema);
