import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    exam: {
      type: String,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    subtopic: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    question: {
      en: { type: String, required: true },
      hi: { type: String },
    },
    options: [
      {
        en: { type: String, required: true },
        hi: { type: String },
      },
    ],
    answer: {
      type: Number, // 0-3 index
      required: true,
    },
    explanation: {
      en: { type: String },
      hi: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast retrieval of questions by hierarchy
questionSchema.index({ exam: 1, subject: 1, topic: 1, subtopic: 1 });

// Text index for fuzzy text search fallbacks
questionSchema.index({ subject: 'text', topic: 'text', subtopic: 'text' });

// Enforce database-level uniqueness on exam and English question text to prevent duplicate seeds within the same exam
questionSchema.index({ exam: 1, 'question.en': 1 }, { unique: true, sparse: true });

const Question = mongoose.model('Question', questionSchema);
export default Question;

