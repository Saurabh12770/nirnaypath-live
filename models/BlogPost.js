'use strict';
const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: 'NirnayPath Editorial'
    },
    tags: [String],
    metaTitle: {
        type: String,
        trim: true
    },
    metaDescription: {
        type: String,
        trim: true
    },
    schemaType: {
        type: String,
        enum: ['Article', 'NewsArticle', 'BlogPosting'],
        default: 'BlogPosting'
    },
    isPublished: {
        type: Boolean,
        default: true,
        index: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

blogPostSchema.index({ isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
