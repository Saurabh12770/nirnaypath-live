# Phase 11 Implementation Plan
## DO NOT IMPLEMENT IMMEDIATELY. THIS IS THE MASTER BLUEPRINT.

## Ordered Execution Phases

### Phase 11A → Schemas & Foundations
- **Files Touched**: `models/testSession.js`, `models/testResult.js`, `models/testViolation.js`.
- **Action**: Add new fields (`telemetryId`, `fraudScore`), deprecate direct answers array inserts.
- **Risk**: Breaking legacy APIs.
- **Strategy**: Implement dual-write logic. Read from legacy fields if new fields are null.

### Phase 11B → Telemetry Buffering
- **Files Touched**: `controllers/exam.js`, `routes/exam.js`, `services/telemetry.js`.
- **Action**: Modify heartbeat to push to Redis Streams instead of updating MongoDB directly.
- **Chaos Validation**: Simulate 50,000 concurrent heartbeats and verify Redis memory doesn't spike uncontrollably.

### Phase 11C → Analytics Workers
- **Files Touched**: `workers/telemetry-processor.js`, `workers/ai-perf-worker.js`.
- **Action**: Build PM2 background workers to drain Redis Streams and batch-insert into MongoDB.

### Phase 11D → Adaptive Engine (IRT)
- **Files Touched**: `services/examGenerator.js`, `models/question.js`.
- **Action**: Integrate Ability (θ) and Difficulty (b) parameters. Change question delivery from batch to streaming.
- **Rollback**: A feature flag `ENABLE_IRT` must wrap this entirely. If true, stream questions. If false, serve static paper.

### Phase 11E → Fraud Intelligence
- **Files Touched**: `services/fraud.js`, `workers/fraud-intelligence-worker.js`.
- **Action**: Implement scoring vectors and real-time Pub/Sub alerts.

### Phase 11F → National Rankings & Normalization
- **Files Touched**: `services/ranking.js`, `workers/normalization-worker.js`.
- **Action**: Implement Redis ZSETs and statistical equating formulas.

## Deployment Strategy
1. Deploy 11A + 11B. Monitor for 48 hours. Ensure legacy CBT still functions perfectly.
2. Deploy 11C + 11E (Shadow Mode). Run the fraud and analytics engines in the background, logging results but taking no action.
3. Deploy 11F (Post-Exam processing only).
4. Deploy 11D (IRT - Optional, based on exam type).

## Chaos Validation Plan
- Run `server/scratch/chaos_suite.js` modified for 10x load against the Redis cluster.
- Kill PM2 workers randomly to verify Redis Stream consumer groups pick up unacknowledged messages.
