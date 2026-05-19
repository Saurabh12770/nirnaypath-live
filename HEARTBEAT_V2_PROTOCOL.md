# Heartbeat V2 Protocol
## 1. Overview
The V2 Heartbeat Protocol optimizes network throughput for 1,000,000 concurrent sessions. It replaces large, stateful syncs with lightweight telemetry deltas buffered through Redis.

## 2. API Contract
`POST /api/test/heartbeat-v2`

**Payload Constraints:**
- Sub-10KB size limit.
- JSON compressed mappings.

**Sample Request:**
```json
{
  "sid": "sess_12345",
  "v": 2,
  "t": [
    { "q": "q_abc", "o": "B", "c": true, "ms": 1450, "h": 1, "r": ["rapid_click"] }
  ],
  "sys": { "lat": 42, "blur": 0 }
}
```

## 3. Processing Pipeline
1. **Edge Termination**: Nginx receives the heartbeat and forwards to the Node.js API.
2. **Dual-Write Router**: 
   - If `ENABLE_TELEMETRY_DUAL_WRITE` is true, the payload is translated to V1 format and sent to MongoDB `TestSession.answers`.
   - Simultaneously, the raw V2 payload is published to the Redis Stream `telemetry:ingest`.
3. **Response**: API immediately returns `202 Accepted`. No synchronous MongoDB `updateOne` is awaited.

## 4. Resilience Guarantees
- **Duplicate Protection**: Event IDs (timestamp + hash) prevent replay attacks.
- **Offline Recovery**: The frontend batches failed heartbeats in IndexedDB and flushes them in a single array upon reconnection.
- **Cluster Safe**: Completely stateless. Any PM2 node can receive the heartbeat and push it to the centralized Redis Stream.
