# MOCK TEST FLOW — FORENSIC TRACE
**NirnayPath 3.0 — Phase 2 Audit**
Generated: 2026-06-17

---

## COMPLETE EXECUTION FLOW

```
User clicks "Start Test" in TestCenter.jsx
         ↓
frontend/src/pages/TestCenter.jsx
  → function TestSetup → handleStart()
  → api.post('/tests/sessions', { testType, exam, subject, topic })
         ↓
frontend/src/services/api.js
  → axios instance (baseURL: '/api')
  → JWT attached from localStorage ('np_token')
         ↓
Vite proxy → backend port 3000
         ↓
backend/app.js
  → app.use('/api/tests', testRoutes)
         ↓
backend/routes/tests.js
  → router.post('/sessions', protect, handler)
         ↓
backend/middleware/auth.js
  → protect() — verifies JWT, attaches req.user
         ↓
backend/routes/tests.js — handler body
  → normalizeSearchCriteria(exam, subject)
  → builds matchQuery
  → Question.aggregate([ { $match }, { $sample: { size: N } } ])
         ↓
backend/models/Question.js → MongoDB 'questions' collection
         ↓
Response: { session: { id, questions (no answers), timeRemaining } }
         ↓
TestCenter.jsx → setSession(res.data.session)
  → renders QuizInterface component
```

---

## DETAILED STEP-BY-STEP TRACE

### STEP 1 — Frontend: TestSetup Component
**File**: `frontend/src/pages/TestCenter.jsx` — `TestSetup` function

```js
// Loads exam list on mount
api.get('/syllabus')  →  GET /api/syllabus

// When exam selected, loads its syllabus
api.get(`/syllabus/${selectedExam.toLowerCase()}`)

// On "Start Test" click:
const body = { testType, exam: selectedExam, subject: selectedSubject, topic: selectedTopic }
const res = await api.post('/tests/sessions', body)
onStart(res.data.session)
```

**testType values**: `'topic'` | `'subject'` | `'full_mock'`

---

### STEP 2 — API Service
**File**: `frontend/src/services/api.js`

```js
axios.create({ baseURL: '/api' })
// Interceptor attaches: Authorization: Bearer <np_token>
```

---

### STEP 3 — Route Mount
**File**: `backend/app.js`, line 45

```js
app.use('/api/tests', testRoutes)
```

---

### STEP 4 — Auth Middleware
**File**: `backend/middleware/auth.js`

```js
protect()  // verifies JWT, sets req.user
```

---

### STEP 5 — Route Handler
**File**: `backend/routes/tests.js`, line 80

```js
router.post('/sessions', protect, async (req, res, next) => {
  const { testType, exam, subject, topic, subtopic } = req.body;
```

---

### STEP 6 — Normalization
**File**: `backend/routes/tests.js`, lines 13–75

```js
const { exam: normExam, subject: normSubject } = normalizeSearchCriteria(exam, subject)
```

Maps frontend labels → DB schema values:
- `'SSC-CGL'` → `'SSC CGL'`
- `'history'` → `'history'` ← ⚠️ LOWERCASE BUG (DB has both 'history' and 'History')

---

### STEP 7 — Question Selection (THE CORE)
**File**: `backend/routes/tests.js`, lines 119–200

```js
// Primary query
const pipeline = [
  { $match: matchQuery },           // exam + subject + topic (if applicable)
  { $sample: { size: questionLimit } }  // random N questions
]
let sampledQuestions = await Question.aggregate(pipeline)
```

**Question limits by testType**:

| testType | questionLimit | timerDuration |
|---|---|---|
| `topic` | 10 | 600s (10 min) |
| `subject` | 20 | 1200s (20 min) |
| `full_mock` | 30 | 1800s (30 min) |

**Fallback cascade** (when results < threshold):

| Condition | Fallback | Label |
|---|---|---|
| topic test < 5 questions | expand to subject-only | `'subject-only'` |
| subject < 3 questions | search all exams | `'cross-exam'` |
| 0 questions found | case-insensitive regex | `'regex-fuzzy'` |
| still 0 | subject regex, all exams | `'regex-emergency'` |

---

### STEP 8 — Session Creation
**File**: `backend/routes/tests.js`, lines 204–215

```js
const session = await TestSession.create({
  userId: req.user._id,
  testType, exam, subject, topic, subtopic,
  questions: sampledQuestions.map(q => q._id),
  timeRemaining: timerDuration,
  status: 'active'
})
```

**Collection**: `testsessions`
**Model**: `backend/models/TestSession.js`

---

### STEP 9 — Response (Sanitized — No Answers Leaked)

```js
const questionsResponse = sampledQuestions.map(q => ({
  _id: q._id,
  exam, subject, topic, subtopic, difficulty,
  question: q.question,
  options: q.options
  // answer and explanation STRIPPED
}))
```

---

### STEP 10 — Submit Flow

```
User submits → api.post(`/tests/sessions/${id}/submit`)
     ↓
backend/routes/tests.js → router.post('/sessions/:id/submit')
     ↓
Loads session + populates questions
     ↓
Grades: session.answers.get(qId) === q.answer
     ↓
TestResult.create({ score, accuracy, strongTopics, weakTopics })
     ↓
Collection: testresults
```

---

## ROOT CAUSE: REPEATED QUESTIONS

> **Question**: Why do users see the same 2–3 questions repeating?

**Root Cause 1 — Duplicate Documents in MongoDB**:
- **65,146 out of 185,510** questions (35.1%) are exact duplicates by question text
- When `$sample` pulls 10 questions from a pool where 35% are duplicates, it statistically picks the same questions frequently
- A question that appears 5× in the DB has 5× the probability of being selected

**Root Cause 2 — No Deduplication**:
- `seedAll.js` uses `Question.insertMany()` with no `upsert` or uniqueness check
- Each seed run can re-insert all 66,976 questions again
- No unique index on `question.en` text in `Question.js` schema

**Root Cause 3 — Cross-Exam Duplication**:
- Same question inserted once per exam (e.g., "What is the capital of India?" appears as UPSC, State PCS, BPSC — 3 separate records)
- `$sample` treats them as distinct candidates

**Root Cause 4 — Small Effective Pool**:
- After fallback cascades, for niche topics, the actual pool may only have 3–5 unique questions
- `$sample: { size: 10 }` from a pool of 3 returns all 3, user always sees the same 3

---

## FIX RECOMMENDATIONS

1. **Add unique index** on `question.en` in `Question.js`:
   ```js
   questionSchema.index({ 'question.en': 1 }, { unique: true, sparse: true })
   ```

2. **Deduplicate MongoDB** before next use:
   ```js
   // Group by question.en, keep only first _id, delete rest
   ```

3. **Fix subject normalizer** to handle both `'history'` and `'History'` → canonical `'History'`

4. **Track shown questions per user session** to avoid repetition even if DB has duplicates
