# National Ranking Engine
## 1. Overview
The National Ranking Engine must support real-time percentile and ranking calculations for up to 1,000,000 concurrent submissions, avoiding the O(N^2) sorting traps common in SQL databases.

## 2. Percentile & Ranking Architecture
- **Core Technology**: Redis Sorted Sets (`ZSET`).
- **Keyspace Strategy**:
  - `rank:AIR:{examId}`: All India Rank.
  - `rank:State:{examId}:{stateCode}`: State Rank.
  - `rank:Category:{examId}:{categoryId}`: Category Rank.

## 3. Streaming Rank Updates
- When a candidate submits an exam, the raw score (or normalized score) is published to a worker queue.
- The worker executes a pipelined Redis `ZADD` to insert the score into the relevant ZSETs.
- To retrieve the rank, the dashboard queries `ZREVRANK rank:AIR:{examId} {userId}`.

## 4. Live Percentiles
- **Formula**: `((N - Rank) / N) * 100`, where `N` is `ZCARD rank:AIR:{examId}`.
- Because `ZREVRANK` and `ZCARD` are O(log(N)) and O(1) respectively, live percentiles can be displayed instantly, even during active exam windows.

## 5. Caching & Archival Strategy
- **Hot Cache**: Redis serves all rank queries during the exam window and 48 hours post-exam.
- **Cold Storage**: After 48 hours, a chron job streams the final rankings from Redis into a MongoDB `Leaderboard` collection for permanent archival, and the Redis keys are evicted.

## 6. Anti-Rank Manipulation
- Temporary scores are generated initially.
- The AI Fraud Engine analyzes the session. If fraud is confirmed, the user is removed from the Redis ZSET via `ZREM`, instantly recalculating percentiles for all legitimate candidates.
