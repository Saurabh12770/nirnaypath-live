# Content Consolidation Audit Report
Generated on: 2026-06-17T17:01:39.786Z

## Executive Summary

| Metric | Count |
|---|---|
| **Current Record Count (DB)** | 20328 |
| **Target Record Count (Syllabus)** | 726 |
| **Matched Records** | 20328 |
| **Unmatched Records** | 0 |
| **Potential Consolidation Ratio** | ~28.0:1 |

## Potential Data Loss Analysis

Data loss is minimized by using a **union-and-deduplicate** strategy for lists (PYQs, Facts, Examples, Tables). However, there are potential areas of concern:

1. **Detailed Explanations in Parts 6–28**: If a subtopic has non-template detailed explanation in parts > 5, this content might be omitted if we only merge parts 2–5. We analyzed these and found **0** subtopics with non-trivial text in later parts.
2. **Duplicate PYQs**: We detected **19602** duplicate PYQ questions across different parts. Merging will clean this up without actual data loss.
3. **Duplicate Facts/Examples**: We detected **39204** duplicate facts and **19602** duplicate examples across parts, which will be deduped during merge.

### Sample of Subtopics with Potential Data Loss Details

| Target Subtopic | Parts Count | Duplicate PYQs | Duplicate Facts | Ignored Text Length (Parts 6-28) |
|---|---|---|---|---|
| UPSC > history > Ancient India > **Prehistoric India & Stone Age** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Indus Valley Civilization — Town Planning & Society** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Indus Valley Civilization — Trade, Religion & Decline** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Vedic Age — Early Vedic Period (Rigvedic)** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Vedic Age — Later Vedic Period & Iron Age** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Mahajanapadas & Rise of Magadha** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Jainism — Mahavira and Jain Philosophy** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Buddhism — Buddha's Life and Teachings** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Buddhist Councils & Spread of Buddhism** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Mauryan Empire — Chandragupta & Ashoka** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Ashokan Edicts & Dhamma** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Post-Mauryan States — Sungas, Kanvas, Satvahanas** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Indo-Greek, Sakas, Kushanas & Parthians** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Sangam Age — Tamil Literature & Society** | 28 | 27 | 54 | 0 chars |
| UPSC > history > Ancient India > **Gupta Empire — Political History** | 28 | 27 | 54 | 0 chars |
| *And 711 more subtopics...* | | | | |

## Unmatched Records (Orphans)

These records in the database do not match any subtopic in the newly restored syllabus files. They will be **archived or deleted** during consolidation.

Total unmatched records: **0**

No unmatched records found. All DB records successfully mapped to the syllabus.

## Sample Merge Mapping

Here is how the 28 parts will map into 1 canonical topic:

### UPSC — history — Ancient India — Prehistoric India & Stone Age
Consolidating **28** records:
- `Prehistoric India & Stone Age — Part 1: Detailed Introduction` (ID: `6a32b556f038c2863418af17`)
- `Prehistoric India & Stone Age — Part 2: Historical Background & Evolution` (ID: `6a32b556f038c2863418af1e`)
- `Prehistoric India & Stone Age — Part 3: Detailed Theory & Core Literature` (ID: `6a32b556f038c2863418af25`)
- `Prehistoric India & Stone Age — Part 4: Concept Breakdown & Key Terminology` (ID: `6a32b556f038c2863418af2c`)
- `Prehistoric India & Stone Age — Part 5: Academic Examples & Scenarios` (ID: `6a32b556f038c2863418af33`)
- ... and 23 more parts.

### UPSC — history — Ancient India — Indus Valley Civilization — Town Planning & Society
Consolidating **28** records:
- `Indus Valley Civilization — Town Planning & Society — Part 1: Detailed Introduction` (ID: `6a32b556f038c2863418afdb`)
- `Indus Valley Civilization — Town Planning & Society — Part 2: Historical Background & Evolution` (ID: `6a32b556f038c2863418afe2`)
- `Indus Valley Civilization — Town Planning & Society — Part 3: Detailed Theory & Core Literature` (ID: `6a32b556f038c2863418afe9`)
- `Indus Valley Civilization — Town Planning & Society — Part 4: Concept Breakdown & Key Terminology` (ID: `6a32b556f038c2863418aff0`)
- `Indus Valley Civilization — Town Planning & Society — Part 5: Academic Examples & Scenarios` (ID: `6a32b556f038c2863418aff7`)
- ... and 23 more parts.

### UPSC — history — Ancient India — Indus Valley Civilization — Trade, Religion & Decline
Consolidating **28** records:
- `Indus Valley Civilization — Trade, Religion & Decline — Part 1: Detailed Introduction` (ID: `6a32b557f038c2863418b09f`)
- `Indus Valley Civilization — Trade, Religion & Decline — Part 2: Historical Background & Evolution` (ID: `6a32b557f038c2863418b0a6`)
- `Indus Valley Civilization — Trade, Religion & Decline — Part 3: Detailed Theory & Core Literature` (ID: `6a32b557f038c2863418b0ad`)
- `Indus Valley Civilization — Trade, Religion & Decline — Part 4: Concept Breakdown & Key Terminology` (ID: `6a32b557f038c2863418b0b4`)
- `Indus Valley Civilization — Trade, Religion & Decline — Part 5: Academic Examples & Scenarios` (ID: `6a32b557f038c2863418b0bb`)
- ... and 23 more parts.

### UPSC — history — Ancient India — Vedic Age — Early Vedic Period (Rigvedic)
Consolidating **28** records:
- `Vedic Age — Early Vedic Period (Rigvedic) — Part 1: Detailed Introduction` (ID: `6a32b557f038c2863418b163`)
- `Vedic Age — Early Vedic Period (Rigvedic) — Part 2: Historical Background & Evolution` (ID: `6a32b557f038c2863418b16a`)
- `Vedic Age — Early Vedic Period (Rigvedic) — Part 3: Detailed Theory & Core Literature` (ID: `6a32b557f038c2863418b171`)
- `Vedic Age — Early Vedic Period (Rigvedic) — Part 4: Concept Breakdown & Key Terminology` (ID: `6a32b557f038c2863418b178`)
- `Vedic Age — Early Vedic Period (Rigvedic) — Part 5: Academic Examples & Scenarios` (ID: `6a32b557f038c2863418b17f`)
- ... and 23 more parts.

### UPSC — history — Ancient India — Vedic Age — Later Vedic Period & Iron Age
Consolidating **28** records:
- `Vedic Age — Later Vedic Period & Iron Age — Part 1: Detailed Introduction` (ID: `6a32b557f038c2863418b227`)
- `Vedic Age — Later Vedic Period & Iron Age — Part 2: Historical Background & Evolution` (ID: `6a32b557f038c2863418b22e`)
- `Vedic Age — Later Vedic Period & Iron Age — Part 3: Detailed Theory & Core Literature` (ID: `6a32b557f038c2863418b235`)
- `Vedic Age — Later Vedic Period & Iron Age — Part 4: Concept Breakdown & Key Terminology` (ID: `6a32b557f038c2863418b23c`)
- `Vedic Age — Later Vedic Period & Iron Age — Part 5: Academic Examples & Scenarios` (ID: `6a32b557f038c2863418b243`)
- ... and 23 more parts.

