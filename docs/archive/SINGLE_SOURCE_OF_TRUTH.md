# SINGLE SOURCE OF TRUTH — ARCHITECTURE DECISION
**NirnayPath 3.0 — Phase 7 Audit**
Generated: 2026-06-17

---

## THE QUESTION

> Where should questions and learning content **ultimately live**?

Two options are on the table:

| | Option A | Option B |
|---|---|---|
| **Name** | JSON-Driven | MongoDB-Driven |
| **Source of Truth** | `data/questions/*.json` files | MongoDB `questions` collection |
| **LearningContent** | Seeder JSON files | MongoDB `learningcontents` collection |
| **Syllabus** | `data/syllabus/*.json` | MongoDB or filesystem |

---

## OPTION A — JSON AS SOURCE OF TRUTH

**How it works**:
- `data/questions/*.json` are the master files
- MongoDB is a read cache, populated on startup or via seeder
- Any content change = edit the JSON file → re-seed → MongoDB reflects it
- Syllabus stays in `data/syllabus/*.json` (works fine as-is)

**Pros**:
- ✅ Git-tracked — all content changes are version-controlled
- ✅ Simple rollback — revert a JSON file to undo a content change
- ✅ Easy bulk editing in any text editor
- ✅ Easy to review/audit content before it goes live
- ✅ No risk of upsert-bugs silently corrupting the DB
- ✅ Works offline / without a live DB for development

**Cons**:
- ❌ Must re-seed after every content change (a few seconds)
- ❌ JSON files are already large (`computerscience.json` = 15.7 MB)
- ❌ No admin panel can edit content without writing back to JSON
- ❌ Multi-user CMS not possible with pure JSON

---

## OPTION B — MONGODB AS SOURCE OF TRUTH

**How it works**:
- MongoDB `questions` and `learningcontents` are the master collections
- JSON files are import-only (one-time import, then discarded)
- Content changes happen directly via admin panel → updates MongoDB
- No re-seeding needed after changes

**Pros**:
- ✅ Admin panel can edit content directly (already partly built in `AdminPanel.jsx`)
- ✅ Real-time content updates without restarting server
- ✅ Better for collaborative content teams
- ✅ Supports atomic updates, transactions, partial edits
- ✅ Scales better when content reaches millions of records

**Cons**:
- ❌ Content not version-controlled (need separate audit log)
- ❌ Upsert bugs can silently corrupt content (already confirmed)
- ❌ DB corruption = content loss (need regular backups)
- ❌ Current DB has 65,146 duplicates — must fix before promoting to SoT

---

## RECOMMENDATION: HYBRID APPROACH (Option A + B)

```
┌─────────────────────────────────────────────────────────┐
│  SINGLE SOURCE OF TRUTH ARCHITECTURE                    │
│                                                         │
│  data/questions/*.json  ──── IMPORT ONLY (one-time)     │
│         ↓ (seedAll.js with dedup)                       │
│  MongoDB questions collection  ←── OPERATIONAL SoT      │
│         ↑                                               │
│  Admin Panel (add/edit/delete individual questions)      │
│                                                         │
│  data/syllabus/*.json  ──── SYLLABUS SoT (filesystem)   │
│         ↓ (read directly per request)                   │
│  Syllabus Route  →  Frontend LearnHub / TestCenter       │
│                                                         │
│  MongoDB learningcontents  ──── CONTENT SoT             │
│         ↑                                               │
│  Seeder scripts (initial fill)                          │
│  Admin Panel (ongoing edits)                            │
└─────────────────────────────────────────────────────────┘
```

### Rules of the Hybrid Architecture

| Data Type | Source of Truth | Editable Via |
|---|---|---|
| Questions | MongoDB (after dedup) | Admin Panel / seeder import |
| Syllabus structure | `data/syllabus/*.json` | File edit + git commit |
| Learning Content | MongoDB | Admin Panel |
| User data | MongoDB | API |

### Why This Works

1. **Questions**: After a one-time dedup and normalization pass, MongoDB becomes the SoT. New questions can be added via Admin Panel or by importing new JSON files with dedup logic.

2. **Syllabus**: `data/syllabus/*.json` is already working perfectly. It's git-tracked, easy to edit, and the route reads it fresh each request. Keep it as-is.

3. **Learning Content**: MongoDB is the right SoT for rich, structured content. The admin panel already supports editing. Fix the upsert bug, then editors can manage content directly.

---

## IMMEDIATE FIXES REQUIRED BEFORE THIS ARCHITECTURE IS VIABLE

### Fix 1 — Deduplicate Questions (BLOCKING)
**Problem**: 65,146 duplicate documents in MongoDB  
**Fix**: Run dedup script that keeps one document per unique `question.en`, deletes rest  
**File**: Create `backend/scripts/deduplicateQuestions.js`

### Fix 2 — Remove Upsert from learn.js (BLOCKING)
**Problem**: Any subtopic visit auto-creates placeholder content  
**Fix**: Change `findOneAndUpdate` with `upsert: true` → `findOne`, return 404 if not found  
**File**: `backend/routes/learn.js` line 21

### Fix 3 — Fix STATE-PCS Naming (BLOCKING)
**Problem**: Syllabus route returns `id: 'STATE-PCS'` but MongoDB stores `exam: 'State PCS'`  
**Fix**: Change syllabus route to return `State PCS` as the exam ID  
**File**: `backend/routes/syllabus.js`

### Fix 4 — Normalize Subject Names (HIGH)
**Problem**: 18+ subject name variants causing pool fragmentation  
**Fix**: Run normalization script to canonicalize all subject names  
**File**: `backend/scripts/normalizeExistingContent.js` (already exists)

### Fix 5 — Add Unique Index on Questions (HIGH)
**Problem**: No uniqueness constraint allows unlimited duplicates  
**Fix**: Add `{ 'question.en': 1 }` unique sparse index  
**File**: `backend/models/Question.js`

### Fix 6 — Delete 7 Placeholder Documents (IMMEDIATE)
**Problem**: 7 garbage docs in `learningcontents` collection  
**Fix**: Run delete query immediately  
**Script**: See `BAD_CONTENT_REPORT.md` Section 1

---

## REBUILD SEQUENCE (Phases 8–10)

Once all 6 fixes above are applied, execute in this order:

```
Phase 8 — Question Engine Rebuild:
  1. deduplicateQuestions.js        — removes 65,146 duplicates
  2. normalizeSubjectNames.js       — fixes 18+ subject variants
  3. Add unique index to Question.js
  4. Fix learn.js upsert bug
  5. Fix STATE-PCS naming in syllabus.js
  6. Delete 7 placeholder LC docs

Phase 9 — Verification:
  1. Run coverageAudit.js           — confirms per-exam question pools
  2. Manual test: start 5 mock tests, verify no repeated questions
  3. Manual test: visit 3 subtopics in LearnHub, verify no placeholder content
  4. Verify STATE-PCS subtopics load State PCS real content

Phase 10 — Final Validation:
  1. Confirm MongoDB question count (should be ~120k after dedup)
  2. Confirm LC count (should be 20,328 after deleting 7 placeholders)
  3. Confirm no subject name fragmentation
  4. Sign off
```
