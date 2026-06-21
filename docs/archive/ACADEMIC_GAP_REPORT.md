# 📊 NirnayPath 3.0 — Academic Gap Report
> Generated: 2026-06-07 | Total Questions in DB: 134,861

---

## Coverage Heatmap

| Exam       | Subjects | Topics | Subtopics | Covered | Coverage % | MCQs   | Notes | PYQs | Status       |
|------------|----------|--------|-----------|---------|------------|--------|-------|------|--------------|
| UPSC       | 7        | 24     | 289       | 0       | **0%**     | 57,711 | 12    | 0    | 🔴 CRITICAL   |
| State PCS  | 7        | 8      | 59        | 0       | **0%**     | 68,568 | 0     | 0    | 🔴 CRITICAL   |
| BPSC       | 6        | 17     | 117       | 0       | **0%**     | 1,550  | 3     | 0    | 🔴 CRITICAL   |
| Banking    | 5        | 6      | 52        | 0       | **0%**     | 1,629  | 1     | 0    | 🔴 CRITICAL   |
| SSC CHSL   | 4        | 8      | 67        | 0       | **0%**     | 10     | 0     | 0    | 🔴 CRITICAL   |
| SSC CGL    | 4        | 12     | 101       | 1       | **1%**     | 3,178  | 2     | 1    | 🟠 LOW        |
| Railway    | 4        | 5      | 41        | 3       | **7.3%**   | 2,215  | 3     | 3    | 🟡 PARTIAL    |

### Summary
- **Total Syllabus Subtopics:** 726
- **Total Covered Subtopics:** 4
- **Overall Platform Coverage:** **0.55%**
- **Total MCQs (all exams):** 134,861 ✅
- **Total Study Notes:** 21
- **Total PYQs in LearnHub:** 4

---

## Exam-by-Exam Breakdown

### 🔴 UPSC (Union Public Service Commission)
- **7 subjects, 24 topics, 289 subtopics**
- 57,711 MCQs seeded ✅ | Notes: 12 | Coverage: **0%**
- **Gaps:** Zero subtopics have linked notes/PYQs in LearningContent
- **Priority:** HIGH — Flagship exam, largest user base
- **Action:** Seed LearningContent for top 30 UPSC subtopics (GS Paper I–IV)

### 🔴 State PCS (State Public Service Commission)
- **7 subjects, 8 topics, 59 subtopics**
- 68,568 MCQs seeded ✅ | Notes: 0 | Coverage: **0%**
- **Gaps:** No notes, no PYQs, no content at all
- **Priority:** HIGH — Largest MCQ pool in DB
- **Action:** Seed 20 State PCS subtopics with notes + PYQs

### 🔴 BPSC (Bihar PSC)
- **6 subjects, 17 topics, 117 subtopics**
- 1,550 MCQs | Notes: 3 | Coverage: **0%**
- **Gaps:** 3 notes exist but zero subtopic linkage (name mismatch)
- **Priority:** HIGH — Regional exam popular with large user base
- **Action:** Fix name-matching; add 20 linked content docs

### 🔴 Banking (IBPS/SBI/RBI)
- **5 subjects, 6 topics, 52 subtopics**
- 1,629 MCQs | Notes: 1 | Coverage: **0%**
- **Gaps:** 1 note exists but no subtopic linked
- **Priority:** MEDIUM — Aptitude-heavy, partially covered by MCQs
- **Action:** Add Reasoning + Quant notes for 15 subtopics

### 🔴 SSC CHSL
- **4 subjects, 8 topics, 67 subtopics**
- Only 10 MCQs — **CRITICAL DATA GAP**
- **Priority:** HIGH — MCQ seeding must happen first
- **Action:** Seed questions + notes for top 25 subtopics

### 🟠 SSC CGL
- **4 subjects, 12 topics, 101 subtopics**
- 3,178 MCQs | Coverage: **1%** (1/101)
- **Priority:** MEDIUM — Decent MCQ pool, notes gap remains
- **Action:** Add notes for Quant, Reasoning, English, GK (20 subtopics)

### 🟡 Railway (RRB/NTPC/Group D)
- **4 subjects, 5 topics, 41 subtopics**
- 2,215 MCQs | Coverage: **7.3%** (3/41)
- **Priority:** MEDIUM — Best-covered exam so far
- **Action:** Expand to remaining 38 subtopics

---

## Root Cause Analysis

### Why coverage is 0% despite 134,861 MCQs?

The MCQs live in the `questions` collection and are counted separately.  
The `LearningContent` collection (notes, PYQs, tables, facts) is the **study layer**.  
The audit matches `LearningContent.subtopic` exactly against `syllabus.subtopic` names.

**Three core gaps:**
1. **LearningContent is nearly empty** — only 21 docs seeded across all exams
2. **Name mismatches** — existing note docs use different subtopic naming than syllabus JSON
3. **SSC CHSL MCQs** — critically under-seeded (only 10 questions)

---

## Phase 2 Action Plan (Content Factory)

### Priority Queue (ranked by impact)

| Priority | Exam       | Target Subtopics | Action                            |
|----------|------------|-----------------|-----------------------------------|
| P1       | UPSC       | 50              | Seed notes + facts + PYQs         |
| P2       | State PCS  | 30              | Seed notes + facts                |
| P3       | Railway    | 38              | Expand existing 3 → all 41        |
| P4       | BPSC       | 30              | Fix naming + seed notes           |
| P5       | SSC CGL    | 25              | Seed notes + aptitude content     |
| P6       | Banking    | 20              | Seed reasoning + quant notes      |
| P7       | SSC CHSL   | 20              | Seed MCQs first, then notes       |

### Content Per Subtopic (Template)
```
notes:    400–600 word markdown study note
facts:    5–8 bullet quick-recall facts
tables:   1–2 comparison/data tables
pyqs:     2–3 previous year questions with answers
```

**Total content docs to create:** ~213 LearningContent documents  
**Estimated seeding scripts:** 7 exam-specific seed files

---

## Verification Targets (Post Phase 2)

| Metric                  | Current | Target     |
|-------------------------|---------|------------|
| Platform Coverage %     | 0.55%   | ≥ 30%      |
| LearningContent docs    | 21      | ≥ 213      |
| Exams with any coverage | 2       | 7          |
| Exams with ≥10% coverage| 1       | 5          |
| PYQs in system          | 4       | ≥ 500      |
| Study Notes             | 21      | ≥ 200      |

---

*Report generated by NirnayPath 3.0 Coverage Audit Engine*
