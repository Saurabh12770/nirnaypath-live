# Phase 11A: Data Forensics & Model Audit
## 1. Executive Summary
This document provides a forensic audit of the existing NirnayPath data models (`TestSession`, `TestResult`, `TestViolation`, `User`, `LiveSession`, `QuestionReservation`). It identifies critical bottlenecks, MongoDB document explosion risks, and memory constraints ahead of the Phase 11 scale-up to 1,000,000+ concurrent candidates.

## 2. Model Weaknesses & Scaling Bottlenecks

### `TestSession` (Critical Risk)
- **Document Growth**: The `answers` Map and `violations` Array grow unbounded during an exam. At 1M candidates, a single update locks the document and inflates MongoDB size, crossing the 16MB limit if large metadata is included.
- **High-Write Contention**: Every heartbeat or answer save updates this document. With PM2 clustering, this causes severe lock contention in MongoDB.
- **Missing Telemetry**: Currently lacks arrays for `timeSpent`, `confidence`, `blurEvents`. Adding these will worsen the document size.

### `TestResult` (Archival Risk)
- **Answers Array**: `answers` array copies entire stringified questions (`question_en`, `explanation_en`) instead of referencing IDs. This causes massive storage waste (O(N) * Questions).
- **Missing Analytics**: Lacks `percentile`, `zScore`, `irtDifficulty`, `fraudProbability`.

### `User` 
- **Array Growth**: `badges`, `refreshTokens` can grow unboundedly, leading to inefficient document updates.
- **Global Locking**: The `lastActiveDate` field updates frequently, causing high-write throughput on a high-value collection.

### `TestViolation`
- **Missing Fraud Analytics**: Stores basic string enums. Needs complex vectors like `confidence`, `networkGraphId`, `fraudScore`.
- **Scaling Threshold**: 1M concurrent users with 2 violations/hour = 2M writes/hour. Needs a Redis buffer before writing to MongoDB.

## 3. Estimated Failure Thresholds
- **MongoDB CPU Exhaustion**: ~45,000 concurrent writes/sec on `TestSession`.
- **Memory OOM**: PM2 Node processes will crash when mapping 10,000 `TestSession` answers objects into memory concurrently.
- **Network I/O**: `TestResult` inserts will saturate MongoDB network pipe due to redundant data (e.g., storing full question text for each user).

## 4. Migration & Backward Compatibility Strategy
- **Incremental Rollout**: Do not drop old fields (`answers` Map, etc.).
- **V2 Schema Injection**: Add new schema references (e.g., `telemetryId`, `resultV2Id`) while keeping V1 populated during the transition window.
- **Dual Writes**: Workers will write to both `TestSession` and the new `Redis Buffer Stream` for exactly 7 days to verify data integrity before phasing out direct MongoDB writes.
- **Data Pruning**: Run background workers to nullify `answers` arrays in `TestResult` older than 30 days, relying strictly on Question ID lookups.
