# Feature Flag Architecture
## 1. Objective
To safely migrate NirnayPath to the Phase 11 AI Exam Intelligence ecosystem, all new core features are wrapped in environment-driven feature flags. This ensures we can rollback any subsystem in milliseconds without dropping live CBT sessions or restarting the PM2 cluster.

## 2. Flag Configuration
File: `config/featureFlags.js`

### Core Flags:
- `ENABLE_V2_TELEMETRY`: Activates the new lightweight `POST /api/test/heartbeat-v2` endpoint.
- `ENABLE_TELEMETRY_DUAL_WRITE`: (Default: True). Ensures telemetry is written to both the old `answers` map and the new Redis Streams buffer.
- `ENABLE_REDIS_STREAMS`: Activates the `TelemetryIngestService` to push payloads to Redis instead of immediate MongoDB writes.
- `ENABLE_AI_ANALYTICS`: Enables the async BullMQ workers for Confidence, Panic, and Hesitation scoring.
- `ENABLE_FRAUD_ENGINE`: Activates the real-time AI Fraud shadow mode.
- `ENABLE_IRT_ENGINE`: Switches the exam delivery from static batching to dynamic θ-based parameter delivery.

## 3. Rollback Strategy
If any subsystem experiences high latency or memory spikes, the environment variable can be toggled via the Railway dashboard. The Node.js application will dynamically respect the flag on the very next request loop, abandoning the new feature path and falling back to the legacy V1 path seamlessly.
