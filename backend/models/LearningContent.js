import mongoose from 'mongoose';

const pyqSchema = new mongoose.Schema({
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
  answer: { type: Number, required: true }, // Index 0-3
  explanation: {
    en: { type: String },
    hi: { type: String },
  },
  year: { type: Number },
});

const learningContentSchema = new mongoose.Schema(
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
    introduction: {
      type: String,
      required: true,
    },
    detailedExplanation: {
      type: String,
      required: true,
    },
    concepts: [{ type: String }],
    importantFacts: [{ type: String }],
    examples: [{ type: String }],
    tables: [
      {
        title: { type: String },
        headers: [{ type: String }],
        rows: [[{ type: String }]],
      },
    ],
    revisionNotes: {
      type: String,
    },
    pyqs: [pyqSchema],
    practiceMcqs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    relatedTopics: [
      {
        exam: String,
        subject: String,
        topic: String,
        subtopic: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for fast hierarchical navigation
learningContentSchema.index({ exam: 1, subject: 1, topic: 1 });
learningContentSchema.index({ exam: 1, subject: 1, topic: 1, subtopic: 1 }, { unique: true });

const LearningContent = mongoose.model('LearningContent', learningContentSchema);
export default LearningContent;
