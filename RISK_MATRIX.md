# NirnayPath Architectural Risk Matrix

This document provides a comprehensive analysis of architectural drifts, broken dependencies, code duplications, and operational risks identified within the NirnayPath codebase.

---

## 1. Risk Matrix Overview

| Risk Identifier | Component | Risk Category | Risk Description | Severity | Coupling | Remediation Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NP-RISK-01** | `services/questionRuntimeEngine.js` | **Reliability / Code Integrity** | **Broken Method Call**: Invokes non-existent method `QuestionRepository.getQuestions()` on line 49. Calling this service layer will throw a runtime `TypeError` and crash the execution thread. | **HIGH** | Tight | Replace call with `QuestionRepository.fetchQuestions()` or deprecate this legacy engine entirely as the active routing path uses `core/questionPipeline.js`. |
| **NP-RISK-02** | `middleware/cache.js`<br>`NotificationCenterService.js`<br>`workers/ai-perf-worker.js` | **Infrastructure / Socket Leaks** | **Rogue Redis Connections**: Independent creation of `ioredis` client instances bypassing the canonical connection pool manager (`services/redisService.js`). Prevents centralized connection pool monitoring, rate limiting, and graceful shutdowns, increasing risk of connection leaks. | **HIGH** | Loose (Duplicate responsibility) | Refactor all rogue files to import `getRedisClient()` or `createNewClient()` from `services/redisService.js` to ensure uniform configurations. |
| **NP-RISK-03** | `services/TelemetryIngestService.js` | **Data Loss / Telemetry** | **No-Op Telemetry Pipeline**: The Redis Stream ingestion command (`redisClient.xAdd`) is commented out on line 19. All telemetry and user heatbeats are dropped silently in production. | **MEDIUM** | Loose | Restore Redis Stream writes or delete the file if telemetry tracking has been deprecated. |
| **NP-RISK-04** | `services/SelfHealingInfrastructureEngine.js`<br>`services/GovernanceIntelligenceEngine.js` | **Operational Integrity** | **Static Mocking in Production**: Key administrative monitoring and self-healing subsystems return static values or randomized numbers (e.g. `Math.random() * 100` for Redis pressure). Gives a false positive health state. | **MEDIUM** | Loose | Replace simulated checks with actual system health statistics (e.g., query Redis info or check PM2 status via API). |
| **NP-RISK-05** | `routes/user.js`<br>`routes/test.js`<br>`services/xpService.js` | **Data Integrity** | **Split Streak Mutations**: Streaks are calculated and mutated in both `routes/user.js` (via user metrics) and `routes/test.js` (during submit). Can lead to desynchronization of streak data if users submit tests concurrently. | **MEDIUM** | Tight | Consolidate all streak mutations, checks, and decay schedules into a single service layer (e.g., within `XPService`). |
| **NP-RISK-06** | `services/questionRepository.js` | **Architecture** | **Dual Source of Truth**: Questions are queried both from MongoDB (`Question` model) and local JSON files (`data/`). Synchronization is manual or script-based, causing drift between data stores. | **MEDIUM** | Tight | Make MongoDB the single source of truth for the question pool and use JSON files solely for database seeding. |
| **NP-RISK-07** | `workers/telemetryFlushWorker.js` | **Maintainability** | **Dormant Worker**: The worker class is defined but not registered in the `workersLoader.js` registry, meaning it is dead weight. | **LOW** | Loose | Remove the dormant file to keep the deployment package lean. |
| **NP-CONC-01** | `routes/test.js`<br>`services/xpService.js` | **Data Integrity** | **Double XP Scoring**: XP and achievement credits awarded twice per test submission due to concurrent route and post-hook calls. | **RESOLVED** | Tight | Deduplicated the route handler/hook in `routes/test.js` to ensure only a single invocation of `awardXP` occurs. |
| **NP-SEC-01** | `middleware/rateLimiter.js`<br>`app.js` | **Security / Brute-force** | **Inactive Rate Limiting**: The rate limiter was registered but silently commented out, leaving endpoints exposed. | **RESOLVED** | Loose | Uncommented and fully activated rate limiter middleware on auth and general API routes. |
| **NP-PERF-01** | `/api/auth/signup`<br>`app.js` | **Performance / Event Loop** | **Bcrypt Starvation**: Pure-JS `bcryptjs` execution blocked the event loop thread under high concurrent signups. | **RESOLVED** | Tight | Migrated to native `bcrypt` (libuv thread pool) and configured salt rounds to 10. |

---

## 2. Detailed Risk Analysis

### 2.1 Critical Crash: NP-RISK-01 (Broken Dependency)
The file [questionRuntimeEngine.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/questionRuntimeEngine.js) is maintained in the codebase as a primary selection tool (referenced in `SYSTEM_STABLE_v1.md` and startup scripts like `questionRealityAudit.js`). 
However, line 49 executes:
```javascript
const questions = await QuestionRepository.getQuestions(filters);
```
Since [questionRepository.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/questionRepository.js) has no `getQuestions` method (only `fetchQuestions`), any execution of this pathway will fail immediately:
```
TypeError: QuestionRepository.getQuestions is not a function
```
*Recommendation*: Either remove this legacy file, or sync it with the standardized [questionPipeline.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/core/questionPipeline.js) flow.

### 2.2 Operational Leakage: NP-RISK-02 (Rogue Redis Connections)
Because `ioredis` creates an open TCP socket to the Redis database, creating clients ad-hoc can exhaust the server's file descriptor quota. The central manager `redisService.js` includes detailed retry caps and error handling. Rogue modules like `NotificationCenterService.js` and `workers/ai-perf-worker.js` spawn their own connections without retry safety or pool bounds.
*Recommendation*: Bind all Redis interactions to the connection client pool managed by `redisService.js`.

### 2.3 Mocked Infrastructure: NP-RISK-04 (Simulated Telemetry)
The self-healing engine simulates replica lag and pressure. In production, this can cause real memory pressure or queue failures to go unnoticed, as the logs will report "HEALTHY" based on random statistics.
*Recommendation*: Replace `Math.random()` checks with genuine system readings (e.g. Mongoose connection statuses).
