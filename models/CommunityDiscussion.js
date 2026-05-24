'use strict';
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const communityDiscussionSchema = new mongoose.Schema({
    targetId: {
        type: String, // questionId or general topicId
        required: true,
        index: true
    },
    targetType: {
        type: String,
        enum: ['question', 'topic', 'general'],
        default: 'general'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema]
}, { timestamps: true });

communityDiscussionSchema.index({ targetId: 1, targetType: 1 });

module.exports = mongoose.model('CommunityDiscussion', communityDiscussionSchema);
