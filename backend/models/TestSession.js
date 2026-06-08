import mongoose from 'mongoose';

const testSessionSchema = new mongoose.Schema(
  {
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
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    answers: {
      type: Map,
      of: Number, // key is questionId (string), value is selectedOptionIndex (0-3)
      default: {},
    },
    timeRemaining: {
      type: Number, // in seconds
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'submitted'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const TestSession = mongoose.model('TestSession', testSessionSchema);
export default TestSession;
