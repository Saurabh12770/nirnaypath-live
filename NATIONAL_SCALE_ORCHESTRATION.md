# National Scale Orchestration
## 1. Overview
Designing for 1,000,000 concurrent candidates requires shifting from a monolithic Node.js pattern to a distributed, stateless orchestration layer resilient to Railway restarts and PM2 clustering.

## 2. Core Architecture
- **Stateless Gateway**: Node.js APIs must retain zero session state in memory. Everything lives in Redis.
- **Sticky Sessions (Websockets)**: For live exam monitoring, Websockets must use Redis Pub/Sub backplanes to ensure messages reach the right client regardless of which PM2 process they hit.
- **Center Allocation System**: Pre-computes and distributes load. Candidates are assigned to logical "Centers" (virtual partitions), allowing the backend to shard database connections based on `centerId`.

## 3. Heartbeat Orchestration
- At 1M users pinging every 15s = ~66,000 requests/sec.
- **Mitigation**: 
  - Nginx/Railway Edge terminates the connection.
  - Rate limiting is pushed to the Redis layer (sliding window).
  - Valid heartbeats are thrown into a Redis Stream.
  - The HTTP response returns `202 Accepted` immediately, *before* MongoDB processing occurs.

## 4. Distributed Session Recovery
- If a candidate's PC crashes, the recovery must be instant.
- The React frontend requests `GET /session/recover`.
- The backend fetches the immutable audit log from MongoDB, replays the Redis telemetry buffer, and reconstructs the exact state (answers, time remaining, warnings) in < 200ms.

## 5. PM2 & Railway Horizontal Scaling
- The app must safely scale to `N` Railway instances.
- **Cron Locks**: Only one instance can run global cron jobs (e.g., Normalization). We implement Redis-based distributed locks (`setnx`) to elect a "master" worker.
