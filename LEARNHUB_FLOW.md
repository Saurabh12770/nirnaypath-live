# LEARNHUB FLOW — FORENSIC TRACE
**NirnayPath 3.0 — Phase 4 Audit**
Generated: 2026-06-17

---

## COMPLETE EXECUTION FLOW

```
User opens LearnHub.jsx
         ↓
ExamCard grid → user clicks exam
         ↓
Syllabus tree expands: Exam → Subject → Topic → Subtopic
         ↓
User clicks a Subtopic
         ↓
ContentReader component mounts
         ↓
api.get(`/learn/content/${exam}/${subject}/${topic}/${subtopic}`)
         ↓
frontend/src/services/api.js
  → axios (baseURL: '/api')
  → JWT attached from localStorage
         ↓
backend/app.js → app.use('/api/learn', learnRoutes)
         ↓
backend/routes/learn.js
  → GET /content/:exam/:subject/:topic/:subtopic
  → LearningContent.findOneAndUpdate() with UPSERT
         ↓
backend/models/LearningContent.js → MongoDB 'learningcontents'
         ↓
Returns content OR auto-creates placeholder
         ↓
ContentReader renders: introduction, detailedExplanation, concepts,
importantFacts, examples, tables, revisionNotes, pyqs, practiceMcqs
```

---

## DETAILED STEP-BY-STEP TRACE

### STEP 1 — Exam List Load
**File**: `frontend/src/pages/LearnHub.jsx`

```js
// On mount — loads exam list from syllabus route
api.get('/syllabus')
→ GET /api/syllabus
→ backend/routes/syllabus.js → reads data/syllabus/*.json
→ returns [ { id, name, icon, description } ]
```

---

### STEP 2 — Syllabus Tree Load
**File**: `frontend/src/pages/LearnHub.jsx`

```js
// When exam selected
api.get(`/syllabus/${exam.id.toLowerCase()}`)
→ GET /api/syllabus/upsc
→ reads data/syllabus/upsc.json from disk
→ returns { subjects: [ { name, topics: [ { name, subtopics: [...] } ] } ] }
```

**Source**: Pure filesystem — `data/syllabus/*.json`
**No MongoDB query** at this stage.

---

### STEP 3 — User Navigates: Exam → Subject → Topic → Subtopic
**File**: `frontend/src/pages/LearnHub.jsx`

```js
// State chain:
selectedExam  → selectedSubject → selectedTopic → selectedSubtopic
     ↓
ContentReader({ exam, subject, topic, subtopic })
```

---

### STEP 4 — Content Fetch (THE CORE — CRITICAL BUG FOUND)
**File**: `frontend/src/pages/LearnHub.jsx`, line 136

```js
api.get(`/learn/content/${encodeURIComponent(exam)}/${encodeURIComponent(subject)}`
        + `/${encodeURIComponent(topic)}/${encodeURIComponent(subtopic)}`)
```

**File**: `backend/routes/learn.js`, line 21

```js
// ⚠️ CRITICAL: findOneAndUpdate with UPSERT
let content = await LearningContent.findOneAndUpdate(
  {
    exam:     new RegExp(`^${escapeRegExp(exam)}$`, 'i'),
    subject:  new RegExp(`^${escapeRegExp(subject)}$`, 'i'),
    topic:    new RegExp(`^${escapeRegExp(topic)}$`, 'i'),
    subtopic: new RegExp(`^${escapeRegExp(subtopic)}$`, 'i'),
  },
  {
    $setOnInsert: {
      exam, subject, topic, subtopic,
      introduction:        `Welcome to the study page for ${subtopic}...`,
      detailedExplanation: `### ${subtopic} Overview\nDetailed concepts... currently being updated...`,
      concepts:            ['Key Terminology', 'Fundamental Framework', 'Core Principles'],
      importantFacts:      [`Exam-relevant points for ${subtopic}.`],
      examples:            [`Illustrative scenarios and case analyses.`],
      tables:              [{ title: `${subtopic} Reference Table`, headers: ['Aspect','Details','Key takeaway'], rows: [...] }],
      revisionNotes:       `Quick bullet points summarizing the essentials of ${subtopic}...`,
      pyqs: [], practiceMcqs: []
    }
  },
  { upsert: true, new: true }
).populate('practiceMcqs');
```

> **⚠️ CRITICAL FINDING**:
> If no real content exists for a subtopic, the API **silently auto-inserts a placeholder document** into MongoDB.
> The user sees fake content. No error is returned. No flag is set.
> This is the source of all "generic AI template" content the user reported.

---

### STEP 5 — Language Switching
**File**: `frontend/src/pages/LearnHub.jsx`, line 83–90

```js
function getLangText(text, lang) {
  const parts = text.split('===HINDI===');
  if (parts.length > 1) {
    return lang === 'hi' ? parts[1].trim() : parts[0].trim();
  }
  return text;
}
```

**Schema**: No separate `en`/`hi` fields for `introduction`, `detailedExplanation`, `revisionNotes`.
Instead, a single string field uses the `===HINDI===` delimiter:

```
English content here.
===HINDI===
हिंदी सामग्री यहाँ।
```

This is a **non-standard workaround** — schema has single String fields, not `{ en, hi }` objects like Questions.

---

### STEP 6 — Content Rendering
**File**: `frontend/src/pages/LearnHub.jsx`

Rendered sections (tabs/panels):

| Tab | Field Rendered | Source |
|---|---|---|
| Notes | `introduction` + `detailedExplanation` | `renderMarkdown()` |
| Key Concepts | `concepts[]` | Array list |
| Important Facts | `importantFacts[]` | Array list |
| Examples | `examples[]` | Array list |
| Tables | `tables[]` | Structured table render |
| Revision | `revisionNotes` | `renderMarkdown()` |
| PYQs | `pyqs[]` | MCQ display |
| Practice MCQs | `practiceMcqs[]` | Linked from Question collection |

---

### STEP 7 — Progress Tracking
**File**: `backend/routes/learn.js`, lines 66–97

```js
// Mark subtopic complete
POST /api/learn/progress
→ user.learningProgress.set(subtopic, true)
→ User.save()

// Get progress
GET /api/learn/progress
→ returns Object.fromEntries(user.learningProgress)
```

**Storage**: `learningProgress` Map field inside `User` document.
**Key**: subtopic string (not ObjectId — fragile if subtopic name changes).

---

## ROOT CAUSE: GENERIC / PLACEHOLDER CONTENT

### Finding 1 — Upsert Auto-creates Fake Docs (7 Confirmed)
The `findOneAndUpdate` with `upsert: true` in `learn.js` creates placeholder docs on first visit for any subtopic not in MongoDB.

**Confirmed placeholder docs in MongoDB** (all `STATE-PCS`):
```
STATE-PCS | History | Indian History & Culture | Rise of Buddhism... Part 3
STATE-PCS | History | Indian History & Culture | Rise of Buddhism... Part 4
STATE-PCS | History | Indian History & Culture | Rise of Buddhism... Part 5
STATE-PCS | History | Indian History & Culture | Rise of Buddhism... Part 6
STATE-PCS | Science | General Science & Tech   | Physics Basics... Part 11
STATE-PCS | Science | General Science & Tech   | Physics Basics... Part 12
STATE-PCS | Science | General Science & Tech   | Physics Basics... Part 13
```

All 7 contain:
- `"currently being updated"` in `detailedExplanation`
- `"Key Terminology"`, `"Fundamental Framework"` in `concepts`
- `"Quick bullet points summarizing"` in `revisionNotes`

### Finding 2 — Naming Mismatch: `STATE-PCS` vs `State PCS`
The syllabus file is named `state-pcs.json`. The route reads it and sends back `id: 'STATE-PCS'`.
The LearnHub sends `exam=STATE-PCS` to the API.
But all real content in MongoDB is stored under `exam: 'State PCS'` (with space, proper case).

**Result**: Every STATE-PCS subtopic visit creates a new placeholder because the regex finds no match for `STATE-PCS` against documents stored as `State PCS`.

---

## LEARNHUB DATA FLOW DIAGRAM

```
data/syllabus/upsc.json (disk)
       ↓ GET /api/syllabus/upsc
LearnHub Tree (frontend)
       ↓ user selects subtopic
GET /api/learn/content/UPSC/History/Ancient India/Vedic Period
       ↓
learningcontents collection
  → FOUND? → return real content
  → NOT FOUND? → auto-insert placeholder → return placeholder ← BUG
```

---

## FIX RECOMMENDATIONS

1. **Remove `upsert: true`** from `learn.js`. Return 404 if content not found. Never auto-create.
   ```js
   // REPLACE:
   LearningContent.findOneAndUpdate(..., { upsert: true, new: true })
   // WITH:
   const content = await LearningContent.findOne({ ... });
   if (!content) return res.status(404).json({ message: 'Content not found' });
   ```

2. **Fix STATE-PCS naming mismatch** in `syllabus.js`:
   ```js
   // Change route return:
   id: examId.toUpperCase()  // produces 'STATE-PCS'
   // Should be:
   id: 'State PCS'  // consistent with MongoDB schema
   ```

3. **Delete the 7 placeholder docs** from MongoDB.

4. **Fix `learningProgress` key** — use `subtopic _id` instead of name string to survive renames.
