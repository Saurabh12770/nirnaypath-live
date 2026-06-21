# NirnayPath 3.0 — Content Density & Record Audit

This document summarizes the current counts and density metrics of all study materials and questions across the seven target exams in the database.

---

## 📊 1. Record Count & Density Metrics (Current)

| Exam Track | Syllabus Subtopics | Learning Records | Current Density | Target Density | Question Count (MCQs) | Unique Topics | Unique Subtopics | Status |
|------------|--------------------|------------------|-----------------|----------------|----------------------|---------------|------------------|--------|
| **UPSC** | 289 | 331 | **1.14** | 15.00+ | 59,979 | 350 | 662 | ⚠️ Low Density |
| **BPSC** | 117 | 123 | **1.05** | 15.00+ | 4,427 | 394 | 506 | ⚠️ Low Density |
| **State PCS** | 59 | 62 | **1.05** | 15.00+ | 69,026 | 547 | 598 | ⚠️ Low Density |
| **SSC CGL** | 101 | 105 | **1.04** | 15.00+ | 3,837 | 522 | 601 | ⚠️ Low Density |
| **SSC CHSL** | 67 | 69 | **1.03** | 15.00+ | 1,788 | 123 | 174 | ⚠️ Low Density |
| **Railway** | 41 | 44 | **1.07** | 15.00+ | 2,455 | 273 | 306 | ⚠️ Low Density |
| **Banking** | 52 | 56 | **1.08** | 15.00+ | 3,342 | 216 | 262 | ⚠️ Low Density |

*   **Total Syllabus Subtopics**: 726
*   **Total Learning Records**: 790
*   **Current Average Content Density**: **1.09**
*   **Target Average Content Density**: **28.00** (20,000+ total learning records)

---

## 🔍 2. Audit Findings & Gaps

1.  **Strict Singularity constraint (Unique Index)**: In `LearningContent.js`, the compound index on `{ exam: 1, subject: 1, topic: 1, subtopic: 1 }` is flagged as `unique: true`. This constraint prevents inserting multiple database records with the identical subtopic name.
2.  **Low Content Density (1.0)**: Currently, every subtopic has exactly one learning content document associated with it. This forms a high-level summary but lacks the structural depth required to replace traditional textbooks, classroom lectures, and coaching modules.
3.  **Target Gap**: To reach **20,000+ total learning records**, each of the 726 subtopics must be expanded into **28 distinct parts/sub-records** representing a density of **28.00**, resulting in exactly **20,328 records**.
