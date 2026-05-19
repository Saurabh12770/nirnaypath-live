# Question Telemetry Architecture
## 1. Overview
To support the AI Exam Intelligence Engine, NirnayPath requires a hyper-granular telemetry capture system. The current static `answers` map in `TestSession` is obsolete. We are moving to a streaming telemetry model.

## 2. Telemetry Payload Contract
Each question attempt will now dispatch the following payload to the server:

```json
{
  "qId": "65ab3d...",
  "opt": "B",
  "corr": true,
  "v": true,
  "m": false,
  "tMs": 14500,
  "conf": 0.85,
  "hes": 2,
  "chg": 1,
  "fSee": 1716075600000,
  "lInt": 1716075614500,
  "rFlags": ["rapid_click", "mouse_leave"],
  "lat": 45,
  "blur": 0
}
```
*(Note: Keys are minified to reduce network payload size at 1,000,000 concurrency)*

## 3. Storage & Write Amplification Strategy
**Problem**: Writing this to MongoDB for every click will destroy the cluster.
**Solution**: 
1. **Client-Side Batching**: The browser collects telemetry events and flushes them every 15 seconds via the Heartbeat Protocol.
2. **Redis Streams**: The Node.js server pushes the incoming batch to a Redis Stream (`exam:telemetry:stream`).
3. **Async Workers**: PM2 background workers consume the Redis Stream, aggregate the telemetry, and perform bulk upserts to MongoDB (`QuestionTelemetry` collection) every 60 seconds.

## 4. Immutable Audit Logs
- Once a telemetry batch is written to MongoDB, it becomes immutable.
- Future modifications (e.g., a candidate changing their answer) generate a *new* telemetry event appending to the timeline.
- This creates an exact chronological audit trail of the candidate's thought process, crucial for fraud detection and IRT.

## 5. Backward Compatibility
The worker will translate the advanced telemetry payload into the legacy `answers` Map format and update `TestSession` simultaneously, ensuring legacy APIs remain functional during the migration phase.
