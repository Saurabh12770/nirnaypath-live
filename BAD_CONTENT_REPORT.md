# BAD CONTENT REPORT
**NirnayPath 3.0 — Phase 5 Audit**
Generated: 2026-06-17

---

## SUMMARY

| Issue Type | Count | Severity |
|---|---|---|
| Placeholder docs (upsert-created fake content) | 7 | 🔴 CRITICAL — DELETE IMMEDIATELY |
| STATE-PCS naming mismatch (will keep regenerating) | 7 | 🔴 CRITICAL — SCHEMA BUG |
| Total LearningContent documents | 20,335 | |
| Real content docs (estimated) | ~20,328 | |
| Questions with duplicate text in MongoDB | 65,146 | 🔴 CRITICAL |
| Subject naming variants (fragmented) | 18+ variants | 🔴 CRITICAL |
| Empty question files (< 25 questions) | 4 files | 🟡 WARNING |

---

## SECTION 1 — CONFIRMED PLACEHOLDER DOCUMENTS

These 7 documents were **auto-created by the upsert bug** in `backend/routes/learn.js`.
They contain no real study content and must be **deleted from MongoDB immediately**.

| # | Exam | Subject | Topic | Subtopic |
|---|---|---|---|---|
| 1 | STATE-PCS | History | Indian History & Culture | Rise of Buddhism, Jainism... Part 3 |
| 2 | STATE-PCS | History | Indian History & Culture | Rise of Buddhism, Jainism... Part 4 |
| 3 | STATE-PCS | History | Indian History & Culture | Rise of Buddhism, Jainism... Part 5 |
| 4 | STATE-PCS | History | Indian History & Culture | Rise of Buddhism, Jainism... Part 6 |
| 5 | STATE-PCS | Science | General Science & Tech | Physics Basics... Part 11 |
| 6 | STATE-PCS | Science | General Science & Tech | Physics Basics... Part 12 |
| 7 | STATE-PCS | Science | General Science & Tech | Physics Basics... Part 13 |

**Placeholder Fingerprints** (all 7 docs match ALL of these):

| Field | Placeholder Value |
|---|---|
| `detailedExplanation` | Contains `"currently being updated by the administration"` |
| `concepts[0]` | `"Key Terminology"` |
| `concepts[1]` | `"Fundamental Framework"` |
| `concepts[2]` | `"Core Principles"` |
| `importantFacts[0]` | `"Exam-relevant points for {subtopic}."` |
| `examples[0]` | `"Illustrative scenarios and case analyses."` |
| `revisionNotes` | `"Quick bullet points summarizing the essentials of {subtopic}..."` |

**Root Cause**: `learn.js` uses `findOneAndUpdate({ upsert: true })`.
When a user navigates to any unloaded subtopic, a placeholder is auto-created.
The bug is compounded by the `STATE-PCS` vs `State PCS` naming mismatch — every visit creates another placeholder.

---

## SECTION 2 — SUBJECT NAMING FRAGMENTATION (QUESTIONS COLLECTION)

The MongoDB `questions` collection has **18+ variants** of the same subject names.
This causes the test engine normalizer to miss matches and trigger costly fallback chains.

| Canonical Name | Bad Variants Found | Impact |
|---|---|---|
| `History` | `history` (10,275 docs) | Normalizer maps to `'history'` → misses `'History'` docs |
| `Science` | `General Science` (1,472), `Science & Technology` (2,096) | Cross-query miss |
| `Mathematics` | `Math` (2,371), `Quantitative Aptitude` (1,752) | Falls back to cross-exam |
| `Reasoning` | `General Intelligence & Reasoning` (1,432) | Fallback triggered |
| `English` | `English Aptitude` (10,695), `English Language` (1,144) | Split pool |
| `Current Affairs` | `Current Affairs & General Awareness` (1,088) | Split pool |
| `Police Science` | `Police_science` (30) | Underscore vs space |
| `Social Science` | `Social_science` (4) | Underscore vs space |

**Effect**: A user selecting `History` for UPSC may get questions from the `history` bucket (10,275 docs) OR the `History` bucket (6,364 docs) depending on normalizer path — never both together. The effective pool is artificially halved.

---

## SECTION 3 — DUPLICATE QUESTIONS (CRITICAL)

| Metric | Value |
|---|---|
| Total questions in MongoDB | 185,510 |
| Unique question texts | ~120,364 (estimated) |
| Exact duplicate texts | **65,146 (35.1%)** |

**How duplicates were created**:

1. **Cross-exam mapping**: A question in `history.json` tagged `['UPSC', 'State PCS']` becomes 2 identical documents, one per exam.
2. **Cross-file overlap**: Same questions appear in multiple JSON files (e.g., History questions in both `history.json` and `general_awareness.json`).
3. **Multiple seeder runs**: No unique constraint on `question.en`. Each full reseed duplicates everything.

**Impact on test quality**:
- `$sample { size: 10 }` from a pool where 35% are duplicates → user sees same question 2–3 times per test
- For small-pool topics (< 15 unique questions), repetition is near-certain
- Users report "same 2–3 questions always appear" — this is the mathematical reason

---

## SECTION 4 — NEAR-EMPTY QUESTION FILES

These files exist in `data/questions/` but contribute negligible unique content:

| File | Questions | Risk |
|---|---|---|
| `social_science.json` | 4 | Any social science test fails immediately, triggers fallback |
| `chemistry.json` | 6 | Chemistry topic tests have 6-question max pool |
| `law.json` | 11 | Law tests fall through to cross-exam fallback |
| `police_science.json` | 20 | Police topic tests have 20-question pool max |
| `test.json` | 1 | Test artifact — no production value (ignored by seeder) |

---

## SECTION 5 — LEARNING CONTENT DISTRIBUTION

Current LearningContent counts per exam:

| Exam | Docs | Coverage |
|---|---|---|
| UPSC | 8,092 | Best covered |
| BPSC | 3,276 | Good |
| SSC CGL | 2,828 | Moderate |
| SSC CHSL | 1,876 | Moderate |
| State PCS | 1,652 | Moderate |
| Banking | 1,456 | Moderate |
| Railway | 1,148 | Low |
| STATE-PCS | 7 | 🔴 All placeholders — wrong exam key |
| **TOTAL** | **20,335** | |

**Key problem**: `STATE-PCS` (7 docs) is a corrupted duplicate of `State PCS` (1,652 docs).
All 7 `STATE-PCS` docs are placeholder garbage.

---

## SECTION 6 — CONTENT ARCHITECTURE PROBLEM (SCHEMA)

The `LearningContent` schema uses **single String fields** for bilingual content:

```js
introduction: { type: String }        // stores "English text ===HINDI=== हिंदी"
detailedExplanation: { type: String } // same delimiter pattern
revisionNotes: { type: String }       // same
```

vs the `Question` schema which uses proper bilingual objects:
```js
question: { en: String, hi: String }
options: [{ en: String, hi: String }]
```

**This inconsistency means**:
- Content cannot be queried by language in MongoDB
- Searching Hindi content is impossible
- The frontend must split every string on `===HINDI===` for every render
- Admin panel cannot cleanly edit EN/HI separately

---

## DELETE SCRIPT — PLACEHOLDER DOCUMENTS

Run this to immediately clean the 7 placeholder docs:

```js
// backend/scripts/deletePlaceholders.js
import mongoose from 'mongoose';
import LearningContent from '../models/LearningContent.js';

await mongoose.connect('mongodb://localhost:27017/nirnaypath');

const result = await LearningContent.deleteMany({
  $or: [
    { detailedExplanation: /currently being updated/i },
    { exam: 'STATE-PCS' }
  ]
});

console.log('Deleted:', result.deletedCount, 'placeholder documents');
await mongoose.disconnect();
```

---

## PRIORITY ACTION LIST

| Priority | Action | File to Change |
|---|---|---|
| 🔴 P0 | Delete 7 placeholder docs from MongoDB | Run delete script |
| 🔴 P0 | Remove `upsert: true` from `learn.js` | `backend/routes/learn.js` |
| 🔴 P0 | Fix STATE-PCS → State PCS in `syllabus.js` | `backend/routes/syllabus.js` |
| 🔴 P1 | Deduplicate 65,146 questions in MongoDB | New dedup script |
| 🔴 P1 | Add unique index on `question.en` | `backend/models/Question.js` |
| 🟡 P2 | Normalize subject names to canonical values | `backend/scripts/normalizeExistingContent.js` |
| 🟡 P2 | Expand `chemistry.json`, `law.json`, `social_science.json` | `data/questions/*.json` |
| 🟡 P3 | Fix LearningContent schema to use `{ en, hi }` objects | `backend/models/LearningContent.js` |
