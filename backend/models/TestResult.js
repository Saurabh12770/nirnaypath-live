import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestSession',
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    testType: {
      type: String,
      enum: ['topic', 'subject', 'full_mock', 'pyq'],
      required: true,
    },
    exam: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
    },
    topic: {
      type: String,
    },
    subtopic: {
      type: String,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    wrongAnswers: {
      type: Number,
      required: true,
    },
    unattempted: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // seconds taken
      required: true,
    },
    analysis: {
      strongTopics: [{ type: String }],
      weakTopics: [{ type: String }],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const TestResult = mongoose.model('TestResult', testResultSchema);
export default TestResult;
