# Ranking Engine V2 Architecture
## 1. Objective
To provide real-time, instantaneous All India Ranks (AIR) and percentiles during high-concurrency exams without executing heavy SQL/Mongo aggregations.

## 2. Redis ZSET Implementation
File: `services/RankingEngine.js`

### Mechanics
- **Insertion**: On test submission, `updateRank` executes a Redis `ZADD` to place the user's score into the `rank:AIR:{examId}` sorted set. O(logN) complexity ensures sub-millisecond writes.
- **Retrieval**: When a candidate views their dashboard, `getRank` executes `ZREVRANK` (to get their zero-indexed position) and `ZCARD` (to get total participants).
- **Percentile Formula**: `((Total - Rank) / Total) * 100`.

## 3. Benefits & Scaling
- This entire process bypasses MongoDB completely for live queries.
- Can handle 10,000+ rank updates per second per Redis node.
- Easily extensible to State and Category ranks by maintaining additional ZSETs (e.g., `rank:State:{examId}:MH`).

## 4. Archival
After the exam window closes (e.g., 48 hours), a final script will scan the Redis ZSET and permanently stamp the `allIndiaRank` into the MongoDB `TestResult` documents for long-term historical queryability.
