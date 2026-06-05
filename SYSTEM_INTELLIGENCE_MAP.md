# NirnayPath System Intelligence Map

This document presents the definitive directory-by-directory master file map of the NirnayPath codebase. For each file, the relationship is mapped as:
`FILE` → `USES (Imports/Dependencies)` → `USED BY (Consumers)`

---

## 1. Directory Overview & Key Statistics
*   **Total Directories Analyzed**: 10
*   **Total Code Files mapped**: ~150 (including 70 services, 24 routes, 25 models, 15 utils, 8 middlewares)
*   **Primary Architecture Pattern**: Layered Express.js Web API with BullMQ queues, worker threads, and Mongoose (MongoDB) database access, guarded by a centralized rate limiter, caching layer, and runtime architecture drift supervisor.

---

## 2. Master Directory Maps

### 2.1 Entry Point (Root)

#### [app.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/app.js)
*   **Purpose**: Main entry point. Configures the Express application, sets up middleware stacks (Helmet, CORS, Morgan, Sentry error tracking, request tracing, compression), establishes DB connections, mounts API routes, runs PM2 node checks, and starts workers and cron engines.
*   **Imports**: `express`, `cors`, `helmet`, `morgan`, `compression`, `mongoose`, `sentry` (via crashReportingService), custom routes, middlewares, services.
*   **Exports**: HTTP Server instance and `gracefulShutdown` function.
*   **Dependencies**: 
    *   [services/envValidationService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/envValidationService.js)
    *   [services/slowQueryLogger.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/slowQueryLogger.js)
    *   [services/redisService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/redisService.js)
    *   [services/cronService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/cronService.js)
    *   [services/workerService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/workerService.js)
    *   [bootstrap/workersLoader.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/bootstrap/workersLoader.js)
    *   [middleware/requestTracing.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/middleware/requestTracing.js)
    *   All mounted route modules in `routes/`
*   **Consumers**: Process manager (`PM2` / `ecosystem.config.js`), node.js runtime (`node app.js`).

---

### 2.2 Bootstrapping Layer (`bootstrap/`)

#### [bootstrap/workersLoader.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/bootstrap/workersLoader.js)
*   **Purpose**: Manages runtime registration and startup of background workers (e.g. `architectureWorker`) safely deferred after port-binding.
*   **Imports**: `workers/architectureWorker.js` (dynamically imported inside run loop).
*   **Exports**: `start(server)` function.
*   **Dependencies**: [workers/architectureWorker.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/workers/architectureWorker.js).
*   **Consumers**: [app.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/app.js) (deferred in startup setImmediate block).

---

### 2.3 Core Execution Layer (`core/`)

#### [core/questionPipeline.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/core/questionPipeline.js)
*   **Purpose**: Coordinates the question selection, filtering, and reservation sequence. The single source of truth for delivering mocks and tests.
*   **Imports**: `crypto`, repository, history, selection, dedup, and reservation services.
*   **Exports**: `QuestionPipeline` class (with static `execute` method).
*   **Dependencies**:
    *   [services/questionRepository.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/questionRepository.js)
    *   [services/historyService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/historyService.js)
    *   [services/selectionEngine.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/selectionEngine.js)
    *   [services/dedupEngine.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/dedupEngine.js)
    *   [services/questionReservationService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/questionReservationService.js)
    *   [utils/questionFingerprint.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/utils/questionFingerprint.js)
*   **Consumers**: [services/questionService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/questionService.js).

---

### 2.4 Configuration Layer (`config/`)

All config files are static files exporting constants/rules used by controllers and middleware.
*   [allowedSubjects.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/config/allowedSubjects.js): Whitelists subjects allowed to be queried. Prevents path traversal directory escapes. (Consumed by `services/questionRepository.js`).
*   [featureFlags.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/config/featureFlags.js): Exports feature configurations like `ENABLE_REDIS_STREAMS`. (Consumed by `services/TelemetryIngestService.js`).
*   [plans.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/config/plans.js): Configures Pro and Free subscription limits (e.g. sectional limits). (Consumed by `middleware/planGuard.js`).
*   [sections.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/config/sections.js): Defines subject exam sections.

---

### 2.5 Middleware Layer (`middleware/`)

Standard Express middleware executing in the routing sequence.

| Middleware File | Purpose | Key Dependencies | Primary Consumers |
| :--- | :--- | :--- | :--- |
| [auth.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/middleware/auth.js) | Validates JWT in authorization header or cookies, attaches user object to request. | `jsonwebtoken`, `models/user.js` | Almost all `/api` routes (e.g., test, user, analytics, chat) |
| [adminAuth.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/middleware/adminAuth.js) | Blocks non-admin users and inactive accounts. | `models/user.js` | `/api/admin`, `/api/admin/live-sessions`, `/api/admin/intelligence` |
| [planGuard.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/middleware/planGuard.js) | Enforces free tier limits (e.g., 2 sectional tests/week) and blocks Pro-only features (advanced analytics). | `models/user.js`, `models/testResult.js`, `config/plans.js` | `routes/analytics.js`, `routes/section.js` |
| [rateLimiter.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/middleware/rateLimiter.js) | Redis-backed rate limiting with local fallback if Redis is down. Sets tiered policies (Auth: 5req/15m, Payment: 15req/15m, Telemetry: 120req/15m). | `services/redisService.js`, `utils/logger.js` | `app.js` (mounted on `/api/test`, `/api/telemetry`, and general routes) |
| [cache.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/middleware/cache.js) | Provides helper functions to fetch/store data using Redis cache with local Map fallback. Uses deep clone/freeze. | `services/redisService.js` | `services/performanceAnalyticsService.js`, analytical routes |
| [hotCache.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/middleware/hotCache.js) | In-memory micro-cache for leaderboard and rapid static resources. | `services/redisService.js` | Leaderboard queries |
| [idempotency.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/middleware/idempotency.js) | Double-submit transaction coordinator. Restricts duplicate API hits (e.g., payments, submissions). | `services/redisService.js` | Checkout and submission endpoints |
| [requestTracing.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/middleware/requestTracing.js) | Allocates unique UUID request-ids and sets AsyncLocalStorage context. | `utils/context.js` | `app.js` (global stack) |

---

### 2.6 Models Layer (`models/`)

Mongoose schemas defining MongoDB database structures.

*   [user.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/user.js): Schema for user authentication, streaks, subscription states, badges, friends list, and the atomic `testStartLock`.
*   [testSession.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/testSession.js): Schema for active test sessions, tracking selected questions, current answers, marks, violations (tab switches, copy/paste), and fraud indicators. Automatically expires after 24h.
*   [testResult.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/testResult.js): Saved test outcomes including answers, scores, ranks, IRT theta scores, and anti-cheat probability metrics.
*   [question.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/question.js): Question bank schema with support for English/Hindi text/options, difficulty, quality scores, and review flags.
*   [questionReservation.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/questionReservation.js): Atomic records tracking active user reservations on question IDs to prevent duplicate delivery in high concurrency states.
*   [UserXP.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/UserXP.js): User gamification profiles tracking experience points, levels, milestone awards, and streak logs.
*   *Other schemas*: [BlogPost.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/BlogPost.js), [CommunityDiscussion.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/CommunityDiscussion.js), [Coupon.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/Coupon.js), [DailyChallenge.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/DailyChallenge.js), [GoalTracker.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/GoalTracker.js), [Institution.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/Institution.js), [Notification.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/Notification.js), [PeerBattle.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/PeerBattle.js), [Referral.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/Referral.js), [StudyGroup.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/StudyGroup.js), [SupportTicket.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/SupportTicket.js), [UserActivityLog.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/UserActivityLog.js), [Wallet.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/Wallet.js), [chatMessage.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/chatMessage.js), [liveResult.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/liveResult.js), [liveSession.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/liveSession.js), [payment.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/payment.js), [testViolation.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/models/testViolation.js).

---

### 2.7 Services Layer (`services/`)

The business logic engines of NirnayPath. There are 70 services; below are the core engines:

| Service File | Purpose | Primary Dependencies | Consumers |
| :--- | :--- | :--- | :--- |
| [redisService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/redisService.js) | Centralized ioredis connection pool manager, supporting cluster mode, retry strategies, and payload compression. | `ioredis`, `zlib`, `utils/logger.js` | Caching middlewares, queues, lock services |
| [cacheLayer.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/cacheLayer.js) | Memory-safe, deep-frozen in-memory cache backing the application to minimize database trips. | `utils/logger.js` | [services/questionRepository.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/questionRepository.js) |
| [questionRepository.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/questionRepository.js) | Retrieves questions from MongoDB and resolves/warms local static JSON files. Applies path validation whitelisting. | `models/question.js`, `config/allowedSubjects.js`, `services/cacheLayer.js` | [core/questionPipeline.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/core/questionPipeline.js) |
| [questionReservationService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/questionReservationService.js) | Handles user-specific question concurrency locks. | `models/questionReservation.js`, `services/distributedLockService.js` | [core/questionPipeline.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/core/questionPipeline.js) |
| [historyService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/historyService.js) | Examines past test results to generate history exclusion windows. | `models/testResult.js`, `utils/questionFingerprint.js` | [core/questionPipeline.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/core/questionPipeline.js) |
| [selectionEngine.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/selectionEngine.js) | Cryptographically shuffles and selects random subset of questions. | `crypto`, `services/semanticDedupService.js` | [core/questionPipeline.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/core/questionPipeline.js) |
| [dedupEngine.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/dedupEngine.js) | Discards semantic duplicates and calculates Levenshtein strings similarity. | `services/semanticDedupService.js` | [core/questionPipeline.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/core/questionPipeline.js), [services/questionRepository.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/questionRepository.js) |
| [xpService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/xpService.js) | Gamification engine awarding points, tracking streak reset, and levels. | `models/UserXP.js`, `services/cacheLayer.js` | `routes/test.js`, `routes/user.js` |
| [achievementService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/achievementService.js) | Evaluates achievement criteria (e.g. streaks, test counts, score averages) to award badges. | `models/UserXP.js`, `services/xpService.js` | `routes/test.js` |
| [cronService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/cronService.js) | Regulates scheduled crons (streak decay reminders, digests, cleanup, counts). | `models/user.js`, `models/UserXP.js`, `services/notificationService.js` | `app.js` |
| [workerService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/workerService.js) | Starts/coordinates BullMQ email & digest workers. | `workers/emailWorker.js`, `workers/digestWorker.js` | `app.js` |
| [performanceAnalyticsService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/performanceAnalyticsService.js) | Calculates average test performance, topic weakness, and readiness indices. | `models/testResult.js`, `models/user.js`, `middleware/cache.js` | `routes/analytics.js` |
| [distributedLockService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/distributedLockService.js) | Provides Redis-backed mutex locks. | `services/redisService.js` | `services/questionReservationService.js` |
| [ArchitectureLockService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/ArchitectureLockService.js) | Performs runtime audit to log architectural drift violations. | `utils/logger.js`, Node require cache | `workers/architectureWorker.js` |

*Note on Stubs / Mocks*: 
- [SelfHealingInfrastructureEngine.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/SelfHealingInfrastructureEngine.js), [GovernanceIntelligenceEngine.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/GovernanceIntelligenceEngine.js), and [TelemetryIngestService.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/TelemetryIngestService.js) are stubbed or commented out.
- [questionRuntimeEngine.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/services/questionRuntimeEngine.js) is a legacy serving engine only invoked in `scripts/questionRealityAudit.js` and contains a broken reference to `QuestionRepository.getQuestions()`.

---

### 2.8 Utilities Layer (`utils/`)

Helper modules providing specialized algorithmic operations.

*   [logger.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/utils/logger.js): Winston/Morgan logging wrapper.
*   [context.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/utils/context.js): Direct wrapper around Node `AsyncLocalStorage` to store context requests.
*   [eventLoopSafeguard.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/utils/eventLoopSafeguard.js): Yields loop execution thread control during intensive tasks (SRE-safety protection).
*   [questionFingerprint.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/utils/questionFingerprint.js): Normative text filters and hash engines to identify semantic overlaps.
*   [sanitizeQuestions.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/utils/sanitizeQuestions.js): Core security utility. Sanitizes question arrays before client delivery, stripping out `correctAnswer`, `explanation`, and `answer`. Includes leak inspectors.
*   [normalizePipelineResult.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/utils/normalizePipelineResult.js): Normalizes raw pipeline output into a consistent contract.

---

### 2.9 Background Workers (`workers/`)

*   [architectureWorker.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/workers/architectureWorker.js): Triggers startup architectural checks in isolated thread. (Loaded via `bootstrap/workersLoader.js`).
*   [emailWorker.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/workers/emailWorker.js): BullMQ processor consuming the `email-queue` to dispatch Nodemailer SMTP emails with retry and DLQ files. (Loaded via `services/workerService.js`).
*   [digestWorker.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/workers/digestWorker.js): BullMQ processor consuming the weekly digest compilation queue. (Loaded via `services/workerService.js`).
*   [telemetryFlushWorker.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/workers/telemetryFlushWorker.js): Dormant Redis Stream flush worker.
*   [ai-perf-worker.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/workers/ai-perf-worker.js): Rogue worker containing its own independent connection to `ioredis` without centralization.

---

### 2.10 Routing Layer (`routes/`)

HTTP endpoint maps.

| Router File | Prefix / Mount | Purpose | Auth & Guards | Core Services |
| :--- | :--- | :--- | :--- | :--- |
| [auth.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/routes/auth.js) | `/api/auth` | User account lifecycle (register, login, refresh, logout). | None / `auth` | `models/user.js`, JWT |
| [test.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/routes/test.js) | `/api/test` | Handles mock tests (start, submit, violations, heartbeats). | `auth`, `testEngineLimiter` | `QuestionService`, `XPService`, `AchievementService`, `models/testSession.js` |
| [admin.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/routes/admin.js) | `/api/admin` | Question upload, review queue management, system stats. | `auth`, `adminAuth` | `models/question.js`, `services/reviewQueueService.js` |
| [analytics.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/routes/analytics.js) | `/api/analytics` | Topic weakness analysis, improvement trends, readiness scores. | `auth`, `requirePlan('advanced_analytics')` | `services/performanceAnalyticsService.js` |
| [leaderboard.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/routes/leaderboard.js) | `/api/leaderboard` | Serves ranking views (weekly, global, friends list). | `auth` | `models/UserXP.js`, `middleware/hotCache.js` |
| [payment.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/routes/payment.js) | `/api/payment` | Razorpay order initiation, webhook signature verification. | `auth` (except webhook) | `services/subscriptionService.js`, Razorpay SDK |
| [user.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/routes/user.js) | `/api/user` | User stats, historical records, streak counts. | `auth` | `models/user.js`, `services/xpService.js` |
| [chat.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/routes/chat.js) | `/api/chat` | AI Tutor chat endpoints with limits. | `auth` | `services/aiTutorService.js` |
