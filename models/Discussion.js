const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Fast sorted fetch for all comments on a question
discussionSchema.index({ questionId: 1, createdAt: 1 });

module.exports = mongoose.model('Discussion', discussionSchema);
