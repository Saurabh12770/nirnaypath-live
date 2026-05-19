# Telemetry Stream Engine
## 1. Objective
To prevent MongoDB write lock contention during peak load (1M concurrent heartbeats), we have introduced a Redis Stream Buffer Layer.

## 2. Architecture Components
### `services/TelemetryIngestService.js`
- **Role**: Called by the Node.js API route.
- **Action**: Immediately serializes the incoming JSON and pushes it to a Redis Stream (`exam:telemetry:stream`) via `XADD`.
- **Latency**: < 2ms execution time. Completely unblocks the Node.js event loop.

### `workers/telemetryFlushWorker.js`
- **Role**: A dedicated PM2 background process (isolated from the API processes).
- **Action**: Uses Redis Consumer Groups (`XREADGROUP`) to pull batches of 1,000 heartbeats. Maps them into `QuestionTelemetry` schema formats, and executes a single MongoDB `bulkWrite`.
- **Acknowledgement**: Uses `XACK` to confirm successful writes.

## 3. Resilience & Fallback
- **Redis Outage**: If Redis goes down, `TelemetryIngestService` catches the exception and falls back to synchronous MongoDB writes (or a local memory array if configured), ensuring data is not lost, albeit at lower performance.
- **Dead-Letter Queue**: Messages that crash the worker (e.g., malformed JSON) remain in the pending list and can be analyzed by SREs using `XPENDING`.
