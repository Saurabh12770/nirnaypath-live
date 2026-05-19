# Schema Migration Report
## 1. Overview
The database layer has been safely extended for Phase 11. We have strictly avoided removing any legacy fields to ensure zero downtime and complete backward compatibility with the existing v1 CBT engine.

## 2. Safely Extended Models
### `TestSession`
Appended optional `telemetryVersion`, `fraudProbabilityScore`, `confidenceScore`, `panicScore`, `carelessMistakeIndex`, `adaptiveDifficulty`, `irtTheta`, `heartbeatVersion`, and `analyticsProcessed`.
*Risk Profile*: Low. These are top-level scalar values. They will not trigger MongoDB document size explosions (unlike arrays or maps).

### `TestResult`
Appended `normalizedScore`, `allIndiaRank`, `stateRank`, `categoryRank`, and `irtThetaFinal` to prepare for the National Ranking and Shift Normalization engines.

### `TestViolation`
Appended `confidenceThreshold`, `networkGraphId`, `fraudScoreWeight`, and `isAIConfirmed` to support the AI Fraud Engine's shadow mode scoring.

## 3. New Model: `QuestionTelemetry`
**Purpose**: To offload the heavy, granular write load from the monolithic `TestSession` document.
**Structure**: Tracks hyper-specific metrics per question attempt (`timeSpentMs`, `hesitationCount`, `riskFlags`).
**Scaling Strategy**: This collection is append-only. Updates are performed by async PM2 workers flushing from Redis streams, completely isolated from the critical exam loop. This prevents locking contention during peak concurrency.
