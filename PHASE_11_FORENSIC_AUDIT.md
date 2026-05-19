# NirnayPath Phase 11 Forensic Audit: Architecture Mapping & Weakness Identification

This document serves as the foundation for the Phase 11 upgrade of NirnayPath. It deeply analyzes the current Phase 10 architecture and identifies specific weaknesses across psychometrics, adaptive testing, fraud detection, and distributed scale.

## 1. Psychometric & AI Performance Intelligence
**Current State:**
- `TestResult.answers` stores basic correctness, topic ID, and explanation.
- `performanceAnalyticsService.js` calculates high-level aggregates (accuracy, total time).
- `studentLearningProfileService.js` calculates learning velocity across the last 10 tests and a simple forgetting curve.

**Identified Weaknesses:**
- **Missing Micro-Timing:** The database does not track the exact time spent *per question*. We cannot detect hesitation, speed-guessing, or time-management anomalies.
- **No Confidence Interval:** Students cannot mark how confident they were. True psychometric engines (like GMAT) factor in confidence vs. correctness.
- **No "Careless Mistake" Engine:** If a student has 95% accuracy in a topic but misses an easy question in 5 seconds, it's a careless mistake. Currently, this is treated as a standard incorrect answer, skewing the learning profile.

## 2. Adaptive Systems Planning
**Current State:**
- `adaptiveLearningService.js` scores a pool of questions *before* a test starts based on past weaknesses, then uses a SelectionService to fetch them.

**Identified Weaknesses:**
- **Static Test Generation:** Once the test starts, the questions are fixed. The engine is not dynamically reacting to the student's live performance.
- **Missing Dynamic Difficulty Balancing:** If a student gets 5 hard questions wrong in a row, the engine does not lower the difficulty mid-test to prevent complete panic or demoralization.
- **No Response Weights:** A hard question and an easy question carry the exact same weight (1 point) in the final score. Adaptive scoring (IRT - Item Response Theory) is missing.

## 3. Fraud Analysis Architecture
**Current State:**
- `testViolation.js` stores discrete events (`tab_switch`, `window_blur`, `copy_paste`).
- `socketService.js` routes warnings to the user based on frontend events.

**Identified Weaknesses:**
- **Siloed Rule-Based Logic:** Violations are just logged and counted. There is no AI model analyzing the *pattern* of violations.
- **No Synchronized Ring Detection:** If 50 students in the same IP subnet answer the exact same 15 questions incorrectly with the exact same distractors, the system won't notice.
- **No Timing Anomaly Detection:** Solving a math question that has a 90-second average solve time in 2 seconds is highly suspicious. The current system cannot flag this.

## 4. Distributed Systems & Scalability (National Scale)
**Current State:**
- `liveSession.js` stores `registeredUsers` as an array of ObjectIds.
- `socketService.js` uses Redis Adapter for horizontal scaling.
- SRE crash reporting and caching layers are implemented.

**Identified Weaknesses:**
- **Document Size Limits:** At 1 lakh concurrent users, storing 100,000 ObjectIds in a single Mongo document (`LiveSession`) will exceed the 16MB BSON limit and crash the database.
- **WebSocket Connection Storms:** If a Railway redeployment happens, 100k WebSockets will reconnect simultaneously, instantly overloading PM2 and Redis.
- **Missing Sharding/Partitioning strategy:** Real-time leaderboard and ranking engines need Redis sorted sets, not MongoDB aggregations, to handle national scale.

## 5. National Ranking & Shift Normalization
**Current State:**
- Ranks are calculated loosely based on absolute test score (`TestResult`).

**Identified Weaknesses:**
- **No Normalization Engine:** If Shift 1 was extremely hard and Shift 2 was easy, absolute scores cannot be compared. We are missing standard statistical normalization formulas (like the one used by NTA/SSC/GATE).
- **Missing Percentile Engine:** Ranks are absolute rather than relative percentiles.

---

## Next Steps for Implementation

1. **Schema Expansion:** Update `TestResult` and `TestSession` schemas to support per-question timing, confidence flags, and careless mistake tags.
2. **Document Generation:** Scaffold the requested architecture documents (AI_EXAM_INTELLIGENCE.md, etc.).
3. **Engine Implementation:** Build `AIPerformanceEngine`, `FraudDetectionEngine`, and `NationalRankingEngine`.
4. **Chaos Suite Upgrade:** Update `nationalChaosSuite.js` to simulate 10k concurrent heartbeat floods and test the new Redis partitioning.
