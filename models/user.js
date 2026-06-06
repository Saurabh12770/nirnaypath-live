const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
        validate: {
            validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: 'Invalid email format'
        }
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: [8, 'Password must be at least 8 characters']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // User progress tracking across structured syllabus content
    progress: [{
        subTopicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LearningContent',
            required: true
        },
        completed: {
            type: Boolean,
            default: true
        },
        completedAt: {
            type: Date,
            default: Date.now
        },
        quizScore: {
            type: Number,
            default: 0
        },
        quizTotal: {
            type: Number,
            default: 0
        }
    }]
});

userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
