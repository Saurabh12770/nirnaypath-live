# Phase 11 SRE Impact Analysis
## 1. Database Sizing Estimates
### MongoDB Growth
- 1,000,000 candidates * 100 questions = 100,000,000 telemetry events per exam.
- At 200 bytes per event, one exam generates ~20GB of raw telemetry data.
- **Risk**: Index size will exceed RAM.
- **Mitigation**: Telemetry collection must be heavily sharded or use Timeseries collections natively in MongoDB.

### Redis Memory Usage
- 1,000,000 active sessions * 5KB session state = ~5GB RAM purely for active states.
- ZSETS for ranking: 1,000,000 * ~100 bytes = ~100MB.
- **Risk**: Redis OOM eviction.
- **Mitigation**: Ensure `maxmemory-policy` is set to `volatile-lru` and TTLs are strictly enforced on all session keys (e.g., 3 hours max).

## 2. Lock Contention & Bottlenecks
- **Hot Collections**: `Leaderboard` and `TestSession` are massive bottlenecks if updated synchronously.
- **Mitigation**: 100% of write-heavy operations must move to asynchronous worker queues (BullMQ/Redis Streams).

## 3. Network Throughput
- Railway internal network limits may throttle Redis-to-Node connections during the peak minute of exam commencement (the "Stampede").
- **Mitigation**: Introduce a "Waiting Room" mechanic. Candidates are admitted in batches of 50,000 every 10 seconds to smooth out the initial login spike.
