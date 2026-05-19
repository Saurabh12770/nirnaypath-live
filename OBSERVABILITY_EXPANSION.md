# Observability Expansion
## 1. Overview
As NirnayPath introduces asynchronous AI and Telemetry workers, standard HTTP health checks (CPU/Memory) are no longer sufficient. SREs need deep visibility into background queue depths to prevent silent failures.

## 2. The `GET /api/health/deep` Endpoint
File: `services/ObservabilityService.js`

This new layer aggregates:
- **telemetryQueueDepth**: Number of pending heartbeats in the Redis Stream. If this spikes, `telemetryFlushWorker` is dead or MongoDB is locking.
- **analyticsWorkerLag**: Number of exams waiting for AI Psychometric scoring.
- **fraudDetectionLag**: Milliseconds delay in real-time fraud scanning.
- **heartbeatLatency**: Real-time measurement of the API ingestion path.

## 3. Degradation Strategy
The health endpoint will automatically downgrade the system status from `ok` to `degraded` if queues exceed safe thresholds (e.g., > 50,000 pending heartbeats). This provides immediate visual alerts to the Railway dashboard, allowing SREs to hot-toggle feature flags (`ENABLE_REDIS_STREAMS = false`) before the memory Out-Of-Memory (OOM) killer kicks in.
