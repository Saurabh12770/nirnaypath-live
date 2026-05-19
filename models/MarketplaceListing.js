const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema({
    publisherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
    publisherType: { type: String, enum: ['institution', 'educator', 'government'], required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['test_series', 'mock_package', 'cbt_exam', 'question_bank', 'premium_course'], required: true },
    status: { type: String, enum: ['draft', 'review', 'published', 'suspended', 'archived'], default: 'draft' },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    tags: [String],
    aiModerationScore: { type: Number, default: 0 }, // Score from AI Moderation Engine
    moderationFlags: [String], // e.g. 'plagiarism', 'offensive_content'
    totalSales: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// SRE / Scale: Indexing
marketplaceListingSchema.index({ status: 1, type: 1 });
marketplaceListingSchema.index({ tags: 1 });
marketplaceListingSchema.index({ publisherId: 1 });
marketplaceListingSchema.index({ createdAt: -1 });

marketplaceListingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
