# NirnayPath 3.0 Database Schema

This document details the MongoDB schemas for the 6 required collections in the NirnayPath 3.0 rebuild. All schemas are mapped using Mongoose.

---

## 1. Collections Overview

The system strictly utilizes the following collections:
- `users`
- `questions`
- `testsessions`
- `testresults`
- `learning_content`
- `bookmarks`

---

## 2. Schema Definitions

### 2.1 Users (`users`)
Stores user profiles, roles, and credentials.

```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true }, // Hashed
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 Questions (`questions`)
Stores individual questions. Structured to support bilingual English/Hindi questions, options, and explanations.

```javascript
{
  _id: ObjectId,
  exam: { type: String, required: true, index: true },          // e.g., 'UPSC', 'SSC CGL'
  subject: { type: String, required: true, index: true },       // e.g., 'History'
  topic: { type: String, required: true, index: true },         // e.g., 'Ancient India'
  subtopic: { type: String, required: true, index: true },      // e.g., 'Indus Valley Civilization'
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  question: {
    en: { type: String, required: true },
    hi: { type: String }
  },
  options: [
    {
      en: { type: String, required: true },
      hi: { type: String }
    }
  ],
  answer: { type: Number, required: true }, // Index of correct option (0-3)
  explanation: {
    en: { type: String },
    hi: { type: String }
  },
  createdAt: Date
}
```
*Index*: Compound index on `{ exam: 1, subject: 1, topic: 1, subtopic: 1 }` for rapid retrieval in both learning content and mock test selection.

### 2.3 Test Sessions (`testsessions`)
Stores active test sessions to track real-time answers, timer, and state.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  testType: { type: String, enum: ['topic', 'subject', 'full_mock', 'pyq'], required: true },
  exam: { type: String, required: true },
  subject: { type: String },
  topic: { type: String },
  subtopic: { type: String },
  questions: [{ type: ObjectId, ref: 'Question' }],
  answers: {
    type: Map,
    of: Number, // Stores questionId -> selectedOptionIndex (0-3)
    default: {}
  },
  timeRemaining: { type: Number, required: true }, // in seconds
  status: { type: String, enum: ['active', 'submitted'], default: 'active' },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.4 Test Results (`testresults`)
Stores the graded submission records and accuracy analytics.

```javascript
{
  _id: ObjectId,
  sessionId: { type: ObjectId, ref: 'TestSession', required: true, unique: true },
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  testType: { type: String, enum: ['topic', 'subject', 'full_mock', 'pyq'], required: true },
  exam: { type: String, required: true },
  subject: { type: String },
  topic: { type: String },
  subtopic: { type: String },
  score: { type: Number, required: true },           // Number of correct answers
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  wrongAnswers: { type: Number, required: true },
  unattempted: { type: Number, required: true },
  accuracy: { type: Number, required: true },         // (correctAnswers / totalQuestions) * 100
  duration: { type: Number, required: true },         // Seconds taken
  analysis: {
    strongTopics: [String],
    weakTopics: [String]
  },
  submittedAt: { type: Date, default: Date.now, index: true }
}
```

### 2.5 Learning Content (`learning_content`)
Holds detailed notes and preparation data for specific subtopics.

```javascript
{
  _id: ObjectId,
  exam: { type: String, required: true, index: true },
  subject: { type: String, required: true, index: true },
  topic: { type: String, required: true, index: true },
  subtopic: { type: String, required: true, unique: true, index: true }, // e.g., 'Indus Valley Civilization'
  introduction: { type: String, required: true },
  detailedExplanation: { type: String, required: true },
  concepts: [{ type: String }],
  importantFacts: [{ type: String }],
  examples: [{ type: String }],
  tables: [
    {
      title: { type: String },
      headers: [String],
      rows: [[String]]
    }
  ],
  revisionNotes: { type: String },
  pyqs: [{
    question: { en: String, hi: String },
    options: [{ en: String, hi: String }],
    answer: Number,
    explanation: { en: String, hi: String },
    year: Number
  }],
  practiceMcqs: [{ type: ObjectId, ref: 'Question' }], // References questions for practice
  relatedTopics: [
    {
      exam: String,
      subject: String,
      topic: String,
      subtopic: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```
*Index*: Compound index on `{ exam: 1, subject: 1, topic: 1 }` for quick hierarchy traversal.

### 2.6 Bookmarks (`bookmarks`)
Enables students to bookmark learning subtopics or individual test questions.

```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['question', 'content'], required: true },
  targetId: { type: ObjectId, required: true }, // Points to either a Question ID or LearningContent ID
  createdAt: { type: Date, default: Date.now }
}
```
*Index*: Compound index on `{ userId: 1, type: 1, targetId: 1 }` to prevent duplicate bookmarks and support quick status checks.
