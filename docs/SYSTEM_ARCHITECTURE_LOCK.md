# SYSTEM ARCHITECTURE LOCK — NirnayPath v1.0
## Phase 19A — Architecture Freeze Document
**Effective Date:** 2026-05-19  
**Status:** 🔒 LOCKED  
**Authority:** Senior Staff SRE / Codebase Forensics Auditor  

> ⚠️ This document defines the canonical, immutable baseline. Any deviation from this
> registry is classified as **architectural drift** and must be flagged to the SRE lead.

---

## 1. ALLOWED SERVICES REGISTRY

### 1a. Core Infrastructure Services (Production-Wired)
| Service File | Responsibility | Wired In |
|---|---|---|
| `services/redisService.js` | **CANONICAL** Redis client singleton | app.js, workers, routes |
| `services/cacheLayer.js` | **CANONICAL** In-process LRU+TTL cache | question pipeline, health |
| `services/cacheCoordinatorService.js` | Thin adapter over cacheLayer (drift detection) | questionRepository |
| `services/distributedLockService.js` | Redis Redlock + memory fallback | test submission |
| `services/circuitBreakerService.js` | Circuit breaker for external deps | email, payment |
| `services/crashReportingService.js` | Sentry integration + local crash dump | app.js (boot) |
| `services/queueService.js` | BullMQ email + digest queue factory | health, workers |
| `services/workerService.js` | Worker lifecycle orchestrator | app.js (boot) |
| `services/cronService.js` | Cron job scheduler | app.js (boot) |
| `services/socketService.js` | Socket.io + Redis pub/sub adapter | app.js (boot) |

### 1b. Question Pipeline Services (Production-Wired)
| Service File | Responsibility | Wired In |
|---|---|---|
| `services/questionRepository.js` | **CANONICAL** question data source | core/questionPipeline |
| `services/questionRuntimeEngine.js` | Runtime question selection + shuffling | questionRepository |
| `services/questionReservationService.js` | Anti-duplicate reservation via Redis | test routes |
| `services/dedupEngine.js` | Fingerprint-based question deduplication | questionRepository |
| `services/questionGenerationService.js` | AI-assisted question generation | admin routes |
| `services/questionQualityService.js` | Quality scoring for generated questions | contentApproval |
| `services/selectionEngine.js` | Topic-weighted selection algorithm | questionRepository |
| `services/questionService.js` | Thin facade → core/questionPipeline | test routes |
| `services/contentApprovalService.js` | Review + approval gate for questions | admin routes |
| `services/reviewQueueService.js` | Review queue management | admin routes |
| `utils/questionLoader.js` | File-based JSON question ingestion | questionRepository |
| `utils/questionNormalizer.js` | Schema normalization of raw question data | questionLoader |
| `utils/questionFingerprint.js` | Canonical hash computation for dedup | dedupEngine |
| `utils/sanitizeQuestions.js` | XSS/injection sanitization | questionLoader |
| `utils/questionIntegrityService.js` | Field-level integrity validation | questionLoader |
| `utils/questionSelectionService.js` | Auxiliary selection logic | selectionEngine |
| `utils/normalizePipelineResult.js` | Pipeline output normalization | questionPipeline |
| `core/questionPipeline.js` | **ORCHESTRATOR** — single pipeline entry | questionService |

### 1c. Exam Engine Services (Production-Wired)
| Service File | Responsibility | Wired In |
|---|---|---|
| `services/historyService.js` | Test session history persistence | test routes |
| `services/performanceAnalyticsService.js` | Per-user analytics computation | analytics routes |
| `services/adaptiveLearningService.js` | Adaptive topic selection (IRT-lite) | learning routes |
| `services/studentLearningProfileService.js` | Student profile persistence | learning routes |
| `services/syllabusIntelligenceService.js` | Syllabus mapping + coverage scoring | learning routes |

### 1d. Communication Services (Production-Wired)
| Service File | Responsibility | Wired In |
|---|---|---|
| `services/emailService.js` | **CANONICAL** transactional email | payment, auth, admin |
| `services/emailDigest.js` | Digest email composer | digestWorker |
| `services/emailMetrics.js` | Email delivery KPI tracker | health route |
| `services/notificationService.js` | In-app notification persistence | multiple routes |
| `services/pushService.js` | Web-push subscription + delivery | push routes |

### 1e. Security & Fraud Services (Production-Wired)
| Service File | Responsibility | Wired In |
|---|---|---|
| `services/semanticFirewallService.js` | Prompt injection + semantic abuse guard | question generation |
| `services/semanticDedupService.js` | NLP-based question similarity | dedup pipeline |
| `middleware/rateLimiter.js` | Express rate limiting (general + auth) | app.js |
| `middleware/auth.js` | JWT verification middleware | all protected routes |
| `middleware/adminAuth.js` | Admin role guard | admin routes |
| `middleware/planGuard.js` | Subscription plan enforcement | premium routes |
| `middleware/premium.js` | Premium feature gating | user routes |
| `middleware/runtimeProtection.js` | Runtime abuse detection | test routes |

### 1f. Operational Services (Production-Wired)
| Service File | Responsibility | Wired In |
|---|---|---|
| `services/aiService.js` | **CANONICAL** Gemini AI client | content, analytics |
| `services/memoryPressureService.js` | Heap monitoring + GC advisory | cronService |
| `services/contentRepairService.js` | Auto-repair of malformed questions | cronService |
| `services/explanationQualityService.js` | Explanation scoring | contentApproval |
| `services/topicTaxonomyService.js` | Topic hierarchy resolution | syllabus |
| `services/subscriptionService.js` | Razorpay subscription management | payment routes |
| `services/badgeService.js` | Achievement badge awarding | test result |
| `utils/logger.js` | Structured JSON logger (single instance) | ALL |
| `utils/context.js` | AsyncLocalStorage request context | app.js |
| `utils/eventLoopSafeguard.js` | Event loop overload protection | cronService |
| `utils/runtimeTrace.js` | Structured execution tracing | pipeline |
| `utils/productionMonitor.js` | System metrics collector | health |
| `utils/fileUtils.js` | Safe file I/O utilities | questionLoader |
| `utils/topicNormalizer.js` | Slug normalization for topic names | selectionEngine |

### 1g. Phase 15-18 Services — ADVISORY ONLY (Not Wired to Production Routes)
| Service File | Status | Risk |
|---|---|---|
| `services/OperationsTelemetryService.js` | Advisory — wired to admin/health only | ⚠️ Mock Mongo lag |
| `services/SelfHealingInfrastructureEngine.js` | Advisory — no auto-remediation | ⚠️ Mock Redis pressure |
| `services/GovernanceIntelligenceEngine.js` | Advisory — no live data hooks | ⚠️ All mocked |
| `services/IncidentPredictionEngine.js` | Advisory — scaffold only | ⚠️ Unverified |
| `services/TelemetryIngestService.js` | Stub — Redis write commented out | ❌ No-op in production |
| `services/NotificationCenterService.js` | Advisory — creates bare `new Redis()` | ❌ **ROGUE CLIENT** |
| `services/NationalAuditLedger.js` | Advisory — feature-flagged | 🟡 Safe if flag=false |
| `services/InstitutionOnboardingService.js` | Advisory — no route wiring | 🟡 Dormant |
| `services/LocalizationEngine.js` | Advisory — no route wiring | 🟡 Dormant |
| `services/SearchIndexService.js` | Advisory — no route wiring | 🟡 Dormant |
| `services/CommunicationOrchestrator.js` | Advisory — no route wiring | 🟡 Dormant |
| `services/DisasterRollbackService.js` | Advisory — no route wiring | 🟡 Dormant |
| `services/AuditForensicsService.js` | Advisory — no route wiring | 🟡 Dormant |
| `services/DigitalTwinEngine.js` | Advisory — no route wiring | 🟡 Dormant |
| `services/TenantAbuseEngine.js` | Advisory — no route wiring | 🟡 Dormant |
| `services/SupportWorkflowService.js` | Advisory — no route wiring | 🟡 Dormant |

---

## 2. FINAL API ROUTES MAP

| Method | Path | Route File | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | routes/auth.js | Public |
| POST | `/api/auth/login` | routes/auth.js | Public |
| POST | `/api/auth/logout` | routes/auth.js | JWT |
| POST | `/api/auth/refresh` | routes/auth.js | JWT |
| GET | `/api/user/profile` | routes/user.js | JWT |
| PUT | `/api/user/profile` | routes/user.js | JWT |
| GET | `/api/test/start` | routes/test.js | JWT |
| POST | `/api/test/submit` | routes/test.js | JWT |
| GET | `/api/test/history` | routes/test.js | JWT |
| GET | `/api/leaderboard` | routes/leaderboard.js | JWT |
| GET | `/api/drill/:subject` | routes/drills.js | JWT |
| GET | `/api/section` | routes/section.js | JWT |
| POST | `/api/push/subscribe` | routes/push.js | JWT |
| POST | `/api/payment/order` | routes/payment.js | JWT |
| POST | `/api/payment/verify` | routes/payment.js | JWT |
| POST | `/api/payment/webhook` | routes/payment.js | HMAC |
| GET | `/api/admin/*` | routes/admin.js | AdminJWT |
| GET | `/api/chat` | routes/chat.js | JWT |
| GET | `/api/analytics` | routes/analytics.js | JWT |
| GET | `/api/learning` | routes/learning.js | JWT |
| GET | `/api/health/deep` | routes/health.js | Public |
| GET | `/api/health/email` | routes/health.js | Public |
| GET | `/api/live` | routes/live.js | JWT |
| GET | `/api/admin/live-sessions` | routes/liveAdmin.js | AdminJWT |
| GET | `/api/*` (catch) | routes/api.js | Public |
| GET | `/health` | app.js inline | Public |
| GET | `/admin` | app.js inline | Public (HTML) |
| GET | `/*` | routes/pages.js | Public (HTML) |

---

## 3. REDIS KEYS SCHEMA (Canonical)

| Key Pattern | Type | TTL | Owner |
|---|---|---|---|
| `lock:*` | String (NX) | Dynamic | distributedLockService |
| `exam:{id}:status` | String | No TTL | OperationsTelemetryService |
| `exam:{id}:regions` | Hash | No TTL | OperationsTelemetryService |
| `exam:{id}:timer_extension` | String | No TTL | OperationsTelemetryService |
| `metrics:active_candidates` | String | No TTL | OperationsTelemetryService |
| `metrics:active_exams` | Set | No TTL | OperationsTelemetryService |
| `metrics:regional_load` | Hash | No TTL | OperationsTelemetryService |
| `metrics:avg_rtt` | String | No TTL | OperationsTelemetryService |
| `metrics:suspicious_spikes` | String | No TTL | OperationsTelemetryService |
| `metrics:active_fraud_reviews` | String | No TTL | OperationsTelemetryService |
| `metrics:wait_rooms` | Hash | No TTL | OperationsTelemetryService |
| `audit:emergency_actions` | Stream | Permanent | OperationsTelemetryService |
| `telemetry:heartbeat_stream` | Stream | Permanent | TelemetryIngestService (stub) |
| `queue:exam_submissions` | List | Dynamic | queueService |
| `nirnaypath:notifications` | Pub/Sub | N/A | socketService |
| `v1_*` | String | 300s | middleware/cache.js (**ROGUE**) |
| `bull:*` | Multiple | BullMQ managed | queueService |

> ⚠️ KEY CONFLICT DETECTED: `middleware/cache.js` creates its own `ioredis` client and uses `v1_` prefixed keys.
> This is a **ROGUE Redis client**. See Architecture Lock Service warnings.

---

## 4. MONGODB COLLECTIONS LIST

| Collection Name | Model File | Owner |
|---|---|---|
| `users` | models/user.js | auth, user routes |
| `questions` | models/question.js | question pipeline |
| `testsessions` | models/testSession.js | test routes |
| `testresults` | models/testResult.js | test routes |
| `testviolations` | models/testViolation.js | runtime protection |
| `payments` | models/payment.js | payment routes |
| `liveresults` | models/liveResult.js | live routes |
| `livesessions` | models/liveSession.js | liveAdmin routes |
| `chatmessages` | models/chatMessage.js | chat routes |
| `questionreservations` | models/questionReservation.js | questionReservationService |
| `questiontelemetries` | models/QuestionTelemetry.js | telemetry |
| `subscriptionplans` | models/SubscriptionPlan.js | subscriptionService |
| `supporttickets` | models/SupportTicket.js | SupportWorkflowService |
| `waroomincidents` | models/WarRoomIncident.js | IncidentPredictionEngine |
| `institutions` | models/Institution.js | InstitutionOnboardingService |
| `pilotinstitutions` | models/PilotInstitution.js | national pilot |
| `marketplacelistings` | models/MarketplaceListing.js | marketplace |
| `billingledgers` | models/BillingLedger.js | billing |
| `payoutledgers` | models/PayoutLedger.js | payout |
| `certificaterecords` | models/CertificateRecord.js | certification |
| `educatorprofiles` | models/EducatorProfile.js | educator |
| `fraudreviewboards` | models/FraudReviewBoard.js | fraud engine |
| `tenantbrandings` | models/TenantBranding.js | multi-tenant |
| `apiclients` | models/ApiClient.js | developer platform |

---

## 5. LOCKED INVARIANTS

1. **Single Redis Client Rule**: All production code MUST obtain a Redis client via `services/redisService.js → getRedisClient()`. Direct `new Redis()` calls are FORBIDDEN in services.
2. **Single Cache Layer Rule**: In-process cache MUST use `services/cacheLayer.js`. No secondary Map-based cache is permitted.
3. **Single AI Client Rule**: All Gemini AI calls MUST route through `services/aiService.js`.
4. **Single Logger Rule**: All structured logging MUST use `utils/logger.js`. Raw `console.log` is permitted only in boot sequence.
5. **Single Question Pipeline Rule**: Question delivery MUST enter via `core/questionPipeline.js → services/questionService.js`. No route handler may query questions directly.
6. **No Synchronous Blocking**: No synchronous file I/O in the request path. All fs operations must be async or deferred to workers.
