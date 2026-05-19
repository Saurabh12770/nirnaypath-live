# Phase 11 Safe Rollout Strategy
## 1. Zero-Downtime Philosophy
We will migrate to the National Scale AI Exam Operating System without ever taking the platform offline or breaking ongoing test sessions. We achieve this via Hot Feature Flags and Dual-Writes.

## 2. Staged Rollout Timeline

### Stage 1: The Shadow Telemetry Layer (Days 1-3)
- **Flags**: `ENABLE_V2_TELEMETRY=true`, `ENABLE_TELEMETRY_DUAL_WRITE=true`, `ENABLE_REDIS_STREAMS=true`
- **Action**: Frontend sends V2 heartbeats. Backend writes to both the legacy `answers` array in MongoDB AND the new Redis Stream.
- **Validation**: Compare old schema vs new schema for discrepancies.

### Stage 2: Background AI Analytics (Days 4-5)
- **Flags**: `ENABLE_AI_ANALYTICS=true`
- **Action**: PM2 background workers begin computing Confidence, Panic, and Hesitation scores.
- **Validation**: Ensure `GET /api/health/deep` shows no worker lag. SRE checks for Mongo CPU spikes.

### Stage 3: Fraud Engine Observability (Days 6-7)
- **Flags**: `ENABLE_FRAUD_ENGINE=true`
- **Action**: Fraud algorithms run, but enforcement is bypassed (Shadow Mode). Data scientists analyze the `fraudProbabilityScore` distributions.

### Stage 4: Ranking V2 Activation (Day 8)
- **Flags**: `ENABLE_RANKING_V2=true`
- **Action**: Redis ZSETs start processing submissions. Live dashboards point to Redis instead of SQL queries.

### Stage 5: Legacy Cutoff & True Scale (Day 14)
- **Flags**: `ENABLE_TELEMETRY_DUAL_WRITE=false`
- **Action**: We stop updating the legacy MongoDB `answers` array. The V2 Stream architecture is now the sole source of truth. NirnayPath is officially operating at Phase 11 National Scale.
