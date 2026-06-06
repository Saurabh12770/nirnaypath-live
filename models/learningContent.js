const mongoose = require('mongoose');

const learningContentSchema = new mongoose.Schema({
    exam: { 
        type: String, 
        required: true, 
        index: true 
    },
    subject: { 
        type: String, 
        required: true, 
        index: true 
    },
    topic: { 
        type: String, 
        required: true, 
        index: true 
    },
    subTopic: { 
        type: String, 
        required: true, 
        index: true 
    },
    introduction: { 
        type: String, 
        required: true 
    },
    conceptExplanation: { 
        type: String, 
        required: true 
    },
    detailedNotes: { 
        type: String, 
        required: true 
    },
    importantFacts: {
        type: [String],
        default: []
    },
    examples: {
        type: [String],
        default: []
    },
    diagrams: [{
        url: String,
        caption: String
    }],
    pyqReferences: {
        type: [String],
        default: []
    },
    revisionNotes: { 
        type: String 
    },
    practiceMcqs: [{
        question: { type: String, required: true },
        options: { type: [String], required: true },
        correctAnswer: { type: Number, required: true }, // index of option (0-based)
        explanation: { type: String }
    }],
    relatedTopics: {
        type: [String],
        default: []
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Ensure uniqueness of a sub-topic per exam/subject/topic structure
learningContentSchema.index({ exam: 1, subject: 1, topic: 1, subTopic: 1 }, { unique: true });

const LearningContent = mongoose.model('LearningContent', learningContentSchema);

module.exports = LearningContent;
