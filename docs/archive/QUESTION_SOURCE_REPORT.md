# QUESTION SOURCE FORENSIC REPORT
**NirnayPath 3.0 — Phase 1 Audit**
Generated: 2026-06-17

---

## SUMMARY

| Metric | Value |
|---|---|
| Raw JSON Files | 20 files |
| Raw Question Count (JSON) | 66,976 |
| Questions in MongoDB | 185,510 |
| Inflation Factor | ×2.77 (questions duplicated across exams) |
| Duplicate Question Texts (MongoDB) | **65,146** |
| Empty Question Text | 0 |
| Questions with No Options | 0 |

---

## SECTION 1 — RAW JSON QUESTION FILES

Location: `data/questions/*.json`

| File | Questions | Status | Default Exam |
|---|---|---|---|
| `aptitude.json` | 2,552 | ✅ USED | SSC CGL |
| `bihar.json` | 2,012 | ✅ USED | BPSC |
| `chemistry.json` | **6** | ⚠️ MICRO — near-empty | UPSC |
| `computerscience.json` | 5,000 | ✅ USED | SSC CGL |
| `current.json` | 5,000 | ✅ USED | SSC CGL |
| `economics.json` | 5,000 | ✅ USED | UPSC |
| `english.json` | 5,002 | ✅ USED | SSC CGL |
| `environment.json` | 5,000 | ✅ USED | UPSC |
| `general_awareness.json` | 4,998 | ✅ USED | SSC CGL |
| `geography.json` | 4,996 | ✅ USED | UPSC |
| `hindi.json` | 5,000 | ✅ USED | SSC CGL |
| `history.json` | 4,994 | ✅ USED | UPSC |
| `law.json` | **11** | ⚠️ MICRO — near-empty | SSC CGL |
| `math.json` | 2,420 | ✅ USED | SSC CGL |
| `police_science.json` | **20** | ⚠️ MICRO — near-empty | State PCS |
| `polity.json` | 5,000 | ✅ USED | UPSC |
| `reasoning.json` | 5,001 | ✅ USED | SSC CGL |
| `science.json` | 4,959 | ✅ USED | UPSC |
| `social_science.json` | **4** | 🔴 DEAD — near-empty | SSC CGL |
| `test.json` | **1** | 🔴 DEAD — test artifact | (ignored) |
| **TOTAL** | **66,976** | | |

> **Critical**: `test.json` is excluded in `seedAll.js` (`f !== 'test.json'`).
> **Critical**: `chemistry.json` (6 Qs), `law.json` (11 Qs), `police_science.json` (20 Qs), `social_science.json` (4 Qs) are effectively empty and cause fallback cascade in the test engine.

---

## SECTION 2 — MONGODB QUESTION DISTRIBUTION

Seeder: `backend/scripts/seedAll.js`
Method: `Question.insertMany()` in chunks of 2,000

Questions per exam in MongoDB (after cross-exam mapping):

| Exam | Questions in MongoDB |
|---|---|
| UPSC | 76,163 |
| State PCS | 72,330 |
| BPSC | 10,979 |
| SSC CGL | 9,493 |
| Banking | 6,254 |
| SSC CHSL | 5,540 |
| Railway | 4,751 |
| **TOTAL** | **185,510** |

> **Why MongoDB (185,510) > JSON (66,976)?**
> The seeder maps questions to multiple exams. A single geography question tagged `['UPSC', 'State PCS']` becomes **2 separate MongoDB documents**. This is the source of the inflation.

---

## SECTION 3 — SUBJECT NAMING FRAGMENTATION (CRITICAL BUG)

The question collection has **fragmented subject names** — the same subject appears under different string values. This directly causes the test engine's normalizer to fail and triggers fallback chains.

| Subject (Correct) | Found As (Broken Variants) | Doc Count |
|---|---|---|
| History | `history` (lowercase) | 10,275 |
| History | `History` (correct) | 6,364 |
| Science | `Science` | 10,709 |
| Science | `General Science` | 1,472 |
| Math | `Math` | 2,371 |
| Math | `Mathematics` | 6,627 |
| Math | `Quantitative Aptitude` | 1,752 |
| Reasoning | `Reasoning` | 13,353 |
| Reasoning | `General Intelligence & Reasoning` | 1,432 |
| English | `English Aptitude` | 10,695 |
| English | `English` | 1,616 |
| English | `English Language` | 1,144 |
| Current Affairs | `Current Affairs` | 10,254 |
| Current Affairs | `Current Affairs & General Awareness` | 1,088 |
| Police Science | `Police_science` | 30 |
| Police Science | `Police Science` | 24 |
| Social Science | `Social_science` | 4 |
| Social Science | `Social Science` | 12 |

> **Root Cause**: The seeder maps subject from the JSON filename (`subjectName.charAt(0).toUpperCase() + subjectName.slice(1)`) but individual question objects inside the JSON override this with their own `item.subject` field, which varies.

---

## SECTION 4 — DUPLICATE QUESTION ANALYSIS (CRITICAL BUG)

**65,146 out of 185,510 questions (35.1%) are exact text duplicates.**

Root causes:
1. Questions tagged with multiple exams → inserted once per exam with identical text
2. Questions appear across multiple JSON files (e.g., a History question appears in both `history.json` and `general_awareness.json`)
3. Re-seeding without deduplication adds all records again

**Impact**: When `$sample` picks from a pool with 35% duplicates, the user sees the same question multiple times even within a single test session.

---

## SECTION 5 — SEEDER FILE INVENTORY

| Seeder | Purpose | Status |
|---|---|---|
| `backend/scripts/seedAll.js` | Master seeder — clears ALL data, seeds from JSON + 2 sample LC docs | ✅ PRIMARY |
| `backend/scripts/seedQuestionsLargePools.js` | Seeds large question pools | ✅ ACTIVE |
| `backend/scripts/seedQuestions_SSC_CHSL.js` | Seeds SSC CHSL specific questions | ✅ ACTIVE |
| `backend/scripts/seedContent.js` | Seeds LearningContent | ✅ ACTIVE |
| `backend/scripts/seedContentFactory.js` | LC factory batch 1 | ✅ ACTIVE |
| `backend/scripts/seedContentFactory2.js` | LC factory batch 2 | ✅ ACTIVE |
| `backend/scripts/seedContentFactory3.js` | LC factory batch 3 | ✅ ACTIVE |
| `backend/scripts/seedContentFactory4.js` | LC factory batch 4 | ✅ ACTIVE |
| `backend/scripts/seedDeepContent.js` | Deep content seeder | ✅ ACTIVE |
| `backend/scripts/seedMicro_UPSC_History.js` | UPSC History micro-content | ✅ ACTIVE |
| `backend/scripts/seedMicro_UPSC_PolGeoEco.js` | UPSC Polity/Geo/Eco micro-content | ✅ ACTIVE |
| `backend/scripts/seedMissingContent.js` | Gap-fill content seeder | ✅ ACTIVE |
| `backend/scripts/seedAcademicUpdates.js` | Academic content updates | ✅ ACTIVE |
| `backend/scripts/seedSubtopicMapper.js` | Subtopic mapping normalization | ✅ ACTIVE |
| `backend/scripts/seedSubtopicNormalization.js` | Normalizes subtopic names | ✅ ACTIVE |
| `backend/scripts/runAllSeeders.js` | Orchestrates all seeders | ✅ ACTIVE |
| `backend/scripts/migrateContent.js` | Content migration utility | ⚠️ LEGACY |
| `backend/scripts/normalizeExistingContent.js` | Normalize existing LC | ⚠️ LEGACY |
| `backend/scripts/generateExpandedContent.js` | AI content generator | ⚠️ LEGACY |

---

## VERDICT

| Finding | Severity |
|---|---|
| 65,146 duplicate questions in MongoDB | 🔴 CRITICAL |
| Subject naming fragmentation (18+ variants) | 🔴 CRITICAL |
| `test.json`, `social_science.json`, `chemistry.json` near-empty | 🟡 WARNING |
| Multiple seeder scripts not coordinated | 🟡 WARNING |
| No deduplication logic in seedAll.js | 🔴 CRITICAL |
