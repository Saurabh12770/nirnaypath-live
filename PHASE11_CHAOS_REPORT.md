# Phase 11 Chaos Report
## 1. Objective
To empirically validate the new V2 architecture's ability to survive catastrophic failure events before production deployment.

## 2. Chaos Scenarios (Automated via `scripts/phase11ChaosSuite.js`)

### Scenario A: 1 Lakh Heartbeat Storm
- **Test**: Inject 100,000 heartbeats in < 10 seconds.
- **Expected Result**: Node.js event loop remains unblocked. Redis memory spikes predictably. MongoDB remains unaffected as the flush worker paces the bulk writes.
- **Validation**: Ensure `GET /api/health/deep` shows high `telemetryQueueDepth` but `ok` status overall.

### Scenario B: PM2 Worker Crash
- **Test**: Hard kill the `telemetryFlushWorker` mid-batch.
- **Expected Result**: Redis Consumer Groups (`PEL` - Pending Entries List) track the unacknowledged messages. When PM2 restarts the worker, it resumes exactly where it left off. ZERO data loss.

### Scenario C: Redis Outage Fallback
- **Test**: Kill the Redis container while exams are live.
- **Expected Result**: `TelemetryIngestService` catches the connection error and gracefully downgrades to direct synchronous MongoDB writes (legacy mode). The SRE dashboard alerts instantly.

## 3. Rollback
If any chaos test fails in staging, the architecture mandates rewriting the fallback logic before Phase 11 rollout proceeds.
