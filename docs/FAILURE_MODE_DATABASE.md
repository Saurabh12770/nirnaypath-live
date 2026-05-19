# FAILURE MODE DATABASE — NirnayPath v1.0
## Phase 19E — System Failure Physics Catalog
**Classification:** SRE Internal  
**Effective Date:** 2026-05-19  

---

## FM-001 — Redis Connection Crash

| Attribute | Detail |
|---|---|
| **ID** | FM-001 |
| **Component** | Redis (all clients) |
| **Severity** | HIGH — Degraded mode, not crash |

**Cause:**  
Network interruption between Railway container and Redis add-on. DNS resolution failure. Redis OOM eviction policy triggering. `REDIS_URL` env var not set.

**Detection Signal:**  
- `[REDIS] Error: ECONNREFUSED` in logs  
- `[REDIS] Max reconnect attempts reached` log line  
- `/api/health/deep` returns `redis.status: unhealthy` or `redis.status: disabled`  
- BullMQ workers silently fail to start (check `[WORKER] Redis not ready`)  
- `isRedisAvailable()` returns `false`  

**Mitigation Strategy:**  
- `redisService.js` retries 10 times with exponential backoff (max 5s)  
- `distributedLockService.js` falls back to in-memory Map locks  
- `middleware/cache.js` falls back to local Map cache  
- BullMQ queues and workers remain dormant (no crash)  
- `cacheLayer.js` (in-process) continues operating  

**Recovery Procedure:**  
1. Verify `REDIS_URL` env var in Railway dashboard  
2. Check Redis add-on status in Railway  
3. Restart service — `redisService.js` will reconnect automatically on next `getRedisClient()` call  
4. Monitor `[REDIS] Client ready` log to confirm recovery  

---

## FM-002 — Redis READONLY Error (Replica Failover)

| Attribute | Detail |
|---|---|
| **ID** | FM-002 |
| **Component** | Redis write path |
| **Severity** | MEDIUM |

**Cause:**  
Redis replica promoted after primary crash. Write operations fail with `READONLY`.

**Detection Signal:**  
- `Error: READONLY You can't write against a read only replica` in logs  
- Write operations to queue, locks, telemetry streams fail  

**Mitigation Strategy:**  
`reconnectOnError: (err) => err.message.includes('READONLY')` in `redisService.js` triggers automatic reconnection to elect new primary.

**Recovery Procedure:**  
1. Client auto-reconnects in ~500ms  
2. Verify failover completed via `/api/health/deep`  
3. No manual intervention required in Railway managed Redis  

---

## FM-003 — MongoDB Connection Failure

| Attribute | Detail |
|---|---|
| **ID** | FM-003 |
| **Component** | MongoDB (mongoose) |
| **Severity** | CRITICAL — All data operations fail |

**Cause:**  
Atlas free-tier network interruption. Connection pool exhausted (>100 concurrent connections). `MONGO_URI` not set.

**Detection Signal:**  
- `MongoDB connection error:` in boot logs  
- `/api/health/deep` returns `mongodb.status: unhealthy`  
- All API routes returning 500 errors  
- `mongoose.connection.readyState !== 1`  

**Mitigation Strategy:**  
- Mongoose auto-reconnects with built-in retry logic  
- No in-memory fallback for database operations (by design — data integrity)  

**Recovery Procedure:**  
1. Check Atlas cluster status  
2. Verify `MONGO_URI` includes `?retryWrites=true&w=majority`  
3. Check connection pool: `mongoose.connection.base?.options?.maxPoolSize`  
4. Restart service if reconnect loop stalls beyond 60s  
5. Monitor for `Connected to MongoDB` log line  

---

## FM-004 — MongoDB Slow Query / Saturation

| Attribute | Detail |
|---|---|
| **ID** | FM-004 |
| **Component** | MongoDB query layer |
| **Severity** | HIGH — Latency cascade |

**Cause:**  
Missing compound indexes on `testSession`, `question` collections. Atlas free-tier IOPS limits hit under >500 concurrent users.

**Detection Signal:**  
- `/api/health/deep` returns `mongodb.pingMs > 200` → `status: degraded`  
- Morgan logs showing p99 > 2000ms for `/api/test/*`  
- `[PERF]` latency traces in logger exceeding 500ms  

**Mitigation Strategy:**  
- `questionRepository.js` uses `precompileAllSubjects()` at boot to cache question pools in `cacheLayer` — reduces per-request Mongo reads by ~80%  
- `cacheCoordinatorService.js` drift detection prevents stale reads  

**Recovery Procedure:**  
1. Identify slow query via Atlas Performance Advisor  
2. Add index: `db.testSessions.createIndex({ userId: 1, status: 1 })`  
3. Increase `maxPoolSize` in `MONGO_URI` if pool exhausted  
4. Upgrade Atlas tier if IOPS limits are structural  

---

## FM-005 — PM2 Cluster Split-Brain

| Attribute | Detail |
|---|---|
| **ID** | FM-005 |
| **Component** | PM2 cluster + Redis pub/sub |
| **Severity** | HIGH — Data inconsistency |

**Cause:**  
Multiple PM2 workers processing the same exam submission due to race condition on shared state. In-memory locks differ between workers since `distributedLockService.js` falls back to per-process Map when Redis is down.

**Detection Signal:**  
- Duplicate `testResult` documents in MongoDB for same `sessionId`  
- `/api/health/deep` shows `pm2.totalInstances > 1` but Redis unavailable  
- `[LOCK][MEMORY]` logs appearing across multiple worker PIDs for same resource  

**Mitigation Strategy:**  
- `distributedLockService.js` uses Redis SET NX as primary lock  
- Fallback memory lock only safe in single-process mode  
- `dedupEngine.js` provides second-layer fingerprint deduplication  

**Recovery Procedure:**  
1. Verify Redis is available — lock contention requires distributed lock  
2. If Redis down: scale PM2 to `instances: 1` until Redis recovers  
3. Check `testResult` collection for duplicates: `db.testresults.aggregate([{$group:{_id:"$sessionId",count:{$sum:1}}},{$match:{count:{$gt:1}}}])`  
4. Delete duplicate entries, keeping the one with earliest `createdAt`  

---

## FM-006 — Cache Desync (In-Process vs Redis)

| Attribute | Detail |
|---|---|
| **ID** | FM-006 |
| **Component** | Cache layer system |
| **Severity** | MEDIUM — Stale data risk |

**Cause:**  
`middleware/cache.js` uses a **separate ioredis client** and separate key namespace (`v1_*`) from the canonical `cacheLayer.js` in-process Map. When a question is updated, `cacheLayer.js` is invalidated but `middleware/cache.js` Redis keys remain stale. Two layers serving different data versions for the same logical resource.

**Detection Signal:**  
- API responses returning old question data after admin updates  
- `cacheCoordinatorService.checkDrift()` returning `true` on every call  
- `cacheLayer.getDiagnostics()` showing high miss rate while Redis cache still returns hits  

**Mitigation Strategy:**  
- `cacheLayer.cleanup()` runs every 60s  
- `CACHE_VERSION` env var can be bumped to invalidate all in-process cache entries  
- `middleware/cache.js` has `CACHE_VERSION = 'v1'` hardcoded — mismatch risk  

**Recovery Procedure:**  
1. Set `CACHE_VERSION=v2` in env to force all in-process cache misses  
2. Flush Redis: `redis-cli FLUSHDB` or use admin endpoint  
3. **Long-term fix**: Remove `middleware/cache.js` Redis client. Route all cache through `cacheLayer.js` only (see FM-006-REMEDIATION in ArchitectureLockService warnings)  

---

## FM-007 — Telemetry Backlog Overload

| Attribute | Detail |
|---|---|
| **ID** | FM-007 |
| **Component** | TelemetryIngestService + Redis Streams |
| **Severity** | LOW (currently stub) → HIGH when enabled |

**Cause:**  
`TelemetryIngestService.ingest()` is a **stub** — the actual `redis.xAdd()` call is commented out. When `ENABLE_REDIS_STREAMS=true`, the stream `exam:telemetry:stream` will accumulate with no consumer group draining it.

**Detection Signal:**  
- `telemetry:heartbeat_stream` XLEN growing unbounded  
- Redis memory usage spiking under high exam load  
- `OperationsTelemetryService.getLiveNationalMetrics()` reporting `redisStreamDepth > 10000`  

**Mitigation Strategy:**  
- Keep `ENABLE_REDIS_STREAMS=false` until consumer group is implemented  
- Set Redis `maxmemory-policy allkeys-lru` as safety valve  

**Recovery Procedure:**  
1. `redis-cli XTRIM exam:telemetry:stream MAXLEN 1000`  
2. Disable `ENABLE_REDIS_STREAMS` immediately  
3. Implement proper consumer group with `XREADGROUP` before re-enabling  

---

## FM-008 — Ranking Inconsistency Under Concurrent Submission

| Attribute | Detail |
|---|---|
| **ID** | FM-008 |
| **Component** | Test submission + leaderboard |
| **Severity** | HIGH — Score integrity |

**Cause:**  
Race condition where two near-simultaneous submissions for the same session bypass distributed lock (Redis down scenario) and write two `testResult` documents. Leaderboard query returns inconsistent score.

**Detection Signal:**  
- Duplicate `testResult` for same `sessionId`  
- Leaderboard score mismatch with what user sees on result page  
- `[LOCK][MEMORY]` appearing for same resource from different PM2 workers  

**Mitigation Strategy:**  
- Distributed lock in test submission route  
- `dedupEngine.js` fingerprint check as secondary guard  
- MongoDB `unique` index on `testResult.sessionId` as tertiary guard  

**Recovery Procedure:**  
1. Identify duplicates via MongoDB aggregation (see FM-005)  
2. Recalculate leaderboard from clean `testResult` documents  
3. Invalidate leaderboard Redis cache: `redis-cli DEL v1_leaderboard_*`  

---

## FM-009 — BullMQ Worker Stall / DLQ Accumulation

| Attribute | Detail |
|---|---|
| **ID** | FM-009 |
| **Component** | emailQueue, digestQueue (BullMQ) |
| **Severity** | MEDIUM — Email delivery failure |

**Cause:**  
Redis connection drop causing BullMQ to fail job processing. SMTP credentials invalid. `nodemailer` transporter timeout.

**Detection Signal:**  
- `/api/health/email` returns `status: degraded`  
- `emailQueue.getFailedCount() > (completedCount * 0.3)` alert triggers  
- `waiting > 20` or `oldestJobLagMs > 120000` alerts in health endpoint  

**Mitigation Strategy:**  
- `circuitBreakerService.js` wraps SMTP calls  
- BullMQ retry with exponential backoff  
- DLQ capped and monitored via `/api/health/email`  

**Recovery Procedure:**  
1. Check `SMTP_*` env vars are valid  
2. Check Redis connectivity (BullMQ requires Redis)  
3. Retry failed jobs: use Bull admin dashboard or `emailQueue.retryJobs()`  
4. If DLQ > 50: investigate root cause before bulk retry  

---

## FM-010 — Rogue Redis Client (NotificationCenterService)

| Attribute | Detail |
|---|---|
| **ID** | FM-010 |
| **Component** | `services/NotificationCenterService.js` |
| **Severity** | HIGH — Unmonitored connection, no error handling |

**Cause:**  
`NotificationCenterService` creates two `new Redis()` instances with **no URL** (falls back to `localhost:6379`), **no retry strategy**, and **no error handler**. In production (Railway), this causes unhandled Redis connection errors that are invisible to the main error tracking system.

**Detection Signal:**  
- Unhandled `Error: connect ECONNREFUSED 127.0.0.1:6379` in logs  
- Memory leak from zombie Redis connection objects  
- `ArchitectureLockService` drift report flagging rogue client  

**Mitigation Strategy:**  
- `NotificationCenterService` is **not wired to any production route** — it is dormant  
- Must NOT be imported until refactored to use `getRedisClient()` from `redisService.js`  

**Recovery Procedure:**  
1. Verify no route imports `NotificationCenterService` (confirmed: zero production imports)  
2. Refactor `NotificationCenterService` to use `getRedisClient()` before wiring  
3. See `ArchitectureLockService.js` for runtime detection  
