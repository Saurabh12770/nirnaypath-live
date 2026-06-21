# NirnayPath 2.0 Forensic Audit Report

This document details the audit of the entire NirnayPath codebase, classifying all files and directories into **KEEP**, **REFACTOR**, or **DELETE** categories in order to strip away architectural bloat and deliver a clean, lightweight Learning + Mock Test Platform.

---

## 1. Core Summary of Deletions

The following systems are identified as dead code or architectural bloat and will be completely deleted:
- **Redis & BullMQ Services**: Removed all ioredis, queue, and background worker logic. Caching and rate-limiting fall back to high-performance in-memory implementations.
- **Generative AI Tutor**: Deleted AI Tutor, AI Study Planner, and explainers.
- **Gamification & Growth systems**: Deleted streaks, XP systems, level-up logic, referrals, badges, wallets, coupons, and study groups.
- **Realtime & Sockets**: Removed socket.io, socket services, and live peer battle sessions.
- **Push Notifications**: Removed web-push, service worker subscription endpoints.
- **Telemetry & Monitoring**: Removed Sentry, slow query logger, runtime monitoring, and telemetry logging middleware/endpoints.

---

## 2. Forensic Classification Map

### 2.1 Root Project Files
| File Path | Status | Action / Rationale |
| :--- | :--- | :--- |
| `app.js` | **REFACTOR** | Strip out Redis, cron, worker loaders, socket, telemetry routing. Simplify middlewares to only keep JWT auth, memory rate limiting, static file serving, and database connection. |
| `package.json` | **REFACTOR** | Remove unused dependencies (`bullmq`, `ioredis`, `@socket.io/redis-adapter`, `@google/generative-ai`, `razorpay`, `web-push`, `nodemailer`, `socket.io`, `socket.io-client`, `puppeteer`, `node-cron`). |
| `docker-compose.yml` | **REFACTOR** | Remove Redis container, keep only MongoDB and Node.js server. |
| `Dockerfile` | **KEEP** | Clean build for Express runtime. |
| `ecosystem.config.js` | **REFACTOR** | Simplify app configuration (single instance, standard start). |
| `eslint.config.mjs` | **KEEP** | Standard developer lint rules. |
| `Readme.md` | **KEEP** | Project documentation. |
| *All temporary / legacy scripts* | **DELETE** | Remove `create_admin_temp.js`, `extract.js`, `generate_cs_final.js`, `integration_test.js`, `promoteAdmin.js`, `test_ui.js`, `upgrade-css.js`, `upgrade-js.js`, `verify_e2e_runtime.js`, `verify_telemetry.js`. |
| *Legacy forensic reports & JSON runs* | **DELETE** | Clean up `AUTH_FORENSIC_REPORT.md`, `BUG_REVIEW_SUMMARY.md`, `CRITICAL_BLOCKER_FORENSIC_REPORT.md`, `DATA_FLOW_GRAPH.md`, `DEPENDENCY_GRAPH.md`, `DEPLOYMENT_SUCCESS_REPORT.md`, `FINAL_RELEASE_CERTIFICATION.md`, `FINAL_SRE_CERTIFICATION.md`, `FORENSIC_MASTER_AUDIT.md`, `PRE_DEPLOYMENT_BLOCKERS.md`, `PRODUCTION_DEPLOYMENT_CHECKLIST.md`, `RISK_MATRIX.md`, `SAFE_DELETION_REPORT.md`, `SRE_FINAL_REPORT.md`, `SYSTEM_INTELLIGENCE_MAP.md`, `SYSTEM_STABLE_v1.md`, `audit_report.json`, `e2e_results.json`, `e2e_runner.js`. |

---

### 2.2 Configuration Layer (`config/`)
| File Path | Status | Action / Rationale |
| :--- | :--- | :--- |
| `config/allowedSubjects.js` | **KEEP** | Critical security whitelist that prevents path traversal exploits. |
| `config/featureFlags.js` | **DELETE** | Feature flags are redundant now. |
| `config/plans.js` | **DELETE** | Payment/tier levels are removed. All users access features equally. |
| `config/sections.js` | **DELETE** | Exam sections are simplified. |

---

### 2.3 Bootstrap & Core Layer (`bootstrap/`, `core/`)
| File Path | Status | Action / Rationale |
| :--- | :--- | :--- |
| `bootstrap/workersLoader.js` | **DELETE** | Workers are not needed. |
| `core/questionPipeline.js` | **DELETE** | Redundant pipeline. Use `QuestionSelectionService` directly. |

---

### 2.4 Middleware Layer (`middleware/`)
| File Path | Status | Action / Rationale |
| :--- | :--- | :--- |
| `middleware/auth.js` | **KEEP** | Standard JWT authentication check. |
| `middleware/adminAuth.js` | **KEEP** | Secures `/api/admin` endpoints. |
| `middleware/rateLimiter.js` | **REFACTOR** | Change rate limiting to utilize local `localLimiterStore = new Map()` exclusively. Remove telemetry and payment limits. |
| `middleware/cache.js` | **REFACTOR** | Convert to local memory-only caching, removing Redis code. |
| `middleware/requestTracing.js` | **DELETE** | Telemetry tracking is removed. |
| `middleware/planGuard.js` | **DELETE** | Tier limits are removed. |
| `middleware/hotCache.js` | **DELETE** | Unused. |
| `middleware/idempotency.js` | **DELETE** | Unused. |

---

### 2.5 Database Models Layer (`models/`)
| File Path | Status | Action / Rationale |
| :--- | :--- | :--- |
| `models/user.js` | **REFACTOR** | Keep fields: `name`, `email`, `password`, `role`, `createdAt`. Add `progress` tracking array. Remove payments, notifications, streaks, chatCount, friends. |
| `models/question.js` | **KEEP** | Core question structure. |
| `models/testSession.js` | **KEEP** | Core test session. |
| `models/testResult.js` | **KEEP** | Core test result. |
| `models/learningContent.js` | **NEW** | Store syllabus-aligned notes, pyqs, facts, diagrams, and practice quizzes. |
| `models/bookmark.js` | **NEW** | User bookmarks mapping for learning material and questions. |
| *All other models* | **DELETE** | Delete: `BlogPost.js`, `CommunityDiscussion.js`, `Coupon.js`, `DailyChallenge.js`, `GoalTracker.js`, `Institution.js`, `Notification.js`, `PeerBattle.js`, `QuestionTelemetry.js`, `Referral.js`, `StudyGroup.js`, `SupportTicket.js`, `UserActivityLog.js`, `UserXP.js`, `Wallet.js`, `chatMessage.js`, `liveResult.js`, `liveSession.js`, `payment.js`, `testViolation.js`. |

---

### 2.6 Services Layer (`services/`)
| File Path | Status | Action / Rationale |
| :--- | :--- | :--- |
| `services/cacheLayer.js` | **KEEP** | In-memory cache helper. Used by repository. |
| `services/questionRepository.js` | **REFACTOR** | Remove Redis caching references, keep whitelisting and MongoDB query + file loader fallback. |
| `services/selectionEngine.js` | **KEEP** | Select questions. |
| `services/dedupEngine.js` | **KEEP** | Clean duplicates. |
| `services/performanceAnalyticsService.js` | **REFACTOR** | Keep: `getOverview`, `getTopicMastery`, `getTrends`. Delete other predictive/SRE components. |
| `services/questionService.js` | **REFACTOR** | Simplify to directly call selection engine without complex locks. |
| `services/syllabusService.js` | **NEW** | Structured syllabus explorer. Reads from `data/syllabus`. |
| `services/learningContentService.js` | **NEW** | Query notes, save progress, manage bookmarks. |
| *All other 60 services* | **DELETE** | Remove all other files under `services/`. |

---

### 2.7 Utilities Layer (`utils/`)
| File Path | Status | Action / Rationale |
| :--- | :--- | :--- |
| `utils/logger.js` | **KEEP** | Console logs. |
| `utils/fileUtils.js` | **KEEP** | Atomic file writes. |
| `utils/questionFingerprint.js` | **KEEP** | Used in deduplication. |
| `utils/questionLoader.js` | **KEEP** | Loads questions from json files. |
| `utils/questionNormalizer.js` | **KEEP** | Cleans raw questions. |
| `utils/questionSelectionService.js` | **KEEP** | Selects test questions. |
| `utils/sanitizeQuestions.js` | **KEEP** | Strips answer/explanation keys before sending to clients. |
| `utils/topicNormalizer.js` | **KEEP** | Normalize topic strings. |
| `utils/context.js` | **DELETE** | Telemetry related context storage. |
| `utils/cursorPagination.js` | **DELETE** | Unused helper. |
| `utils/eventLoopSafeguard.js` | **DELETE** | Yielding helper. |
| `utils/normalizePipelineResult.js` | **DELETE** | Unused. |
| `utils/questionIntegrityService.js` | **DELETE** | Complex automated tests. |
| `utils/runtimeTrace.js` | **DELETE** | Telemetry. |
| `utils/telemetryStore.js` | **DELETE** | Telemetry. |

---

### 2.8 Routing Layer (`routes/`)
| File Path | Status | Action / Rationale |
| :--- | :--- | :--- |
| `routes/pages.js` | **REFACTOR** | Expose landing views `/`, `/learn`, `/mock-tests`, `/dashboard`, `/profile`, `/about`, `/admin`. |
| `routes/auth.js` | **REFACTOR** | Clean endpoints for user accounts (Register, Login, Me, Logout). |
| `routes/learning.js` | **REFACTOR** | Expose endpoints for structured syllabus Explorer, content details, bookmarks, progress. |
| `routes/test.js` | **REFACTOR** | Start test, local autosave, submit test, fetch history. |
| `routes/admin.js` | **REFACTOR** | Clean endpoints for administering questions, notes, syllabus, users, and simple reports. |
| *All other routers* | **DELETE** | Remove: `api.js` (merge as needed), `chat.js`, `drills.js`, `engagement.js`, `growth.js`, `live.js`, `liveAdmin.js`, `notifications.js`, `push.js`, `payment.js`, `recommendations.js`, `section.js`, `seo.js`, `stats.js`, `telemetry.js`. |

---

### 2.9 Background Workers (`workers/`)
| File Path | Status | Action / Rationale |
| :--- | :--- | :--- |
| `workers/` (entire folder) | **DELETE** | No background queues, cron workers, or Redis Streams. |

---

### 2.10 Public (Frontend) Layer (`public/`)
| File Path | Status | Action / Rationale |
| :--- | :--- | :--- |
| `public/style.css` | **REFACTOR** | Clean up unused selectors, add beautiful Multicolor UI styling (Indigo, Purple, Orange, Emerald gradient style) for Learn, Mock Test, Dashboard, and Admin panels. |
| `public/index.html` | **REFACTOR** | Home page. Add top navigation bar and a stunning visual hero introducing Learn and Mock Test systems. |
| `public/about.html` | **KEEP** | About page. |
| `public/learn.html` | **NEW** | Rich learning companion page with syllabus list, topic details, examples, facts, diagrams, PYQs, bookmarks, and a practice MCQ quiz at the bottom. |
| `public/mock-tests.html` | **NEW** | Mock Test interface. Exam selector, Subject/Topic list, Start test mode, side quiz navigation, timer, flags, review panel, and clear results sheet. |
| `public/dashboard.html` | **NEW** | User metrics console showing overall stats, Accuracy per Subject, Topic mastery charts, Strong/Weak topics tables, and recent test attempt details. |
| `public/admin.html` | **REFACTOR** | Refactor to allow admins to create syllabus items, upload notes, manage user profiles, and manage questions database. |
| *Other HTML files* | **DELETE** | Delete: `live-leaderboard.html`, `national-status.html`, `notification-center.html`, `performance-intelligence.html`, `reset-password.html`, `review-admin.html`, `trust-center.html`, `mobile-app-shell.html`. |
| `public/js/app.js` | **REFACTOR** | Global frontend bootstrapper. Configures header navigation, handles responsive layouts, dark/light modes. |
| `public/js/auth.js` | **REFACTOR** | Clean interface with Register, Login modal windows, keeping JWT session credentials. |
| `public/js/learn.js` | **NEW** | JS module to interact with `/api/learning` to load syllabus, display notes, run practice questions, toggle bookmarks, and update completion status. |
| `public/js/mock-tests.js` | **NEW** | Test engine interface (heartbeat, autosave, keyboard question navigation, anti-cheat blurred notifications, submission). |
| `public/js/dashboard.js` | **NEW** | Client side statistics renderer (renders charts with fallback/canvas elements, handles lists of weak/strong topics, recent tests). |
| `public/js/admin.js` | **REFACTOR** | Client logic for admin management of subjects, questions, notes, and users. |
| *Other frontend scripts* | **DELETE** | Delete: `appState.js`, `asyncManager.js`, `authStore.js`, `chart-fallback.js`, `chatbot.js`, `events.js`, `growthBanners.js`, `growthConfig.js`, `intelligence.js`, `lifecycle.js`, `live.js`, `mobile-shell.js`, `offlineStorage.js`, `performance-intelligence.js`, `push.js`, `realtime.js`, `referral.js`, `renderController.js`, `reviewAdminRuntime.js`, `socialProof.js`, `telemetry.js`, `uiState.js`, `utils.js`. |
