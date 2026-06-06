const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },
    contentType: { 
        type: String, 
        enum: ['learning_content', 'question'], 
        required: true 
    },
    contentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    title: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

bookmarkSchema.index({ userId: 1, contentType: 1, contentId: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
