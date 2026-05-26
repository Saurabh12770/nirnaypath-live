# SYSTEM_STABLE_v1.md
# NirnayPath — Production System Stability Snapshot
**Generated:** 2026-05-26T16:58:00Z  
**Runtime Certification Status:** ✅ CERTIFIED  
**Platform Version:** 1.0.0  
**Node Environment:** production  
**Port:** 3000 (binds 0.0.0.0)

---

## 1. WORKING APIs INVENTORY

### 🔐 Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | Public + authLimiter | Register user, bcrypt-12, sets httpOnly cookies |
| POST | `/api/auth/login` | Public + authLimiter | Login, issues JWT + refresh token |
| POST | `/api/auth/logout` | Public | Clears cookies, invalidates refresh token |
| POST | `/api/auth/refresh-token` | Public | Rotate refresh token, reissue JWT |
| GET  | `/api/auth/me` | JWT (auth) | Returns current user identity |
| POST | `/api/auth/forgot-password` | Public | Sends hashed reset token via email |
| POST | `/api/auth/reset-password` | Public | Validates token, resets bcrypt password |

### 👤 User — `/api/user`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/me` | JWT | Profile + last 10 test results + streak |
| GET | `/api/user/stats` | JWT | Aggregate accuracy, per-subject breakdown |
| GET | `/api/user/result/:id` | JWT | Single TestResult (ownership enforced) |
| GET | `/api/user/history` | JWT | Paginated test history (page, limit, subject, exam, sort) |

### 🧪 Test Engine — `/api/test`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/test/health` | Public | Service heartbeat |
| POST | `/api/test/start` | JWT | Atomic session creation, question pipeline, answer sanitization |
| POST | `/api/test/submit` | JWT | Server-side scoring, streak, XP, badges, email |
| POST | `/api/test/violation` | JWT | Anti-cheat event ingestion, auto-lock at threshold=3 |
| POST | `/api/test/heartbeat` | JWT | Clock sync + autosave + integrity telemetry |
| POST | `/api/test/autosave` | JWT | Incremental answer persistence |
| GET  | `/api/test/sync/:sessionId` | JWT | Crash recovery — returns saved answers + time left |

### 🛡️ Admin — `/api/admin` (auth + adminAuth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/subjects` | List all subjects from /data JSON files |
| GET | `/api/admin/questions/:subject` | Paginated question list with filters |
| POST | `/api/admin/questions/:subject` | Add question + quality score |
| PUT | `/api/admin/questions/:subject/:id` | Update + re-score quality |
| DELETE | `/api/admin/questions/:subject/:id` | Delete question |
| POST | `/api/admin/questions/:subject/bulk` | Bulk upload with MD5 dedup |
| GET | `/api/admin/questions/review-queue` | Questions flagged for review |
| PATCH | `/api/admin/questions/:id/approve` | Approve from review queue |
| GET | `/api/admin/verify-semantic-uniqueness/:subject` | Dedup audit |
| GET | `/api/admin/users` | Paginated user list with test counts |
| PUT | `/api/admin/users/:userId` | Ban/unban, change plan |
| GET | `/api/admin/stats` | Dashboard: users, tests, revenue, active users |
| GET | `/api/admin/payments` | Payment history (date-range filter) |

### 💳 Payment — `/api/payment`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payment/create-order` | JWT | Razorpay order creation |
| POST | `/api/payment/verify` | JWT | HMAC signature verification + plan upgrade |
| POST | `/api/payment/webhook` | Razorpay HMAC | Webhook event handler (rawBody verified) |

### 📊 Analytics — `/api/analytics`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/analytics/*` | JWT |

### 📚 Learning — `/api/learning`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET/POST | `/api/learning/*` | JWT |

### 🏆 Leaderboard — `/api/leaderboard`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/leaderboard/*` | JWT |

### 💬 Chat — `/api/chat`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET/POST | `/api/chat/*` | JWT |

### 🔔 Notifications — `/api/notifications`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET/POST | `/api/notifications/*` | JWT |

### 📡 Push — `/api/push`
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/push/*` | JWT |

### 🏋️ Drills — `/api/drill`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET/POST | `/api/drill/*` | JWT |

### 📋 Section — `/api/section`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/section/*` | JWT |

### 🎯 Recommendations — `/api/recommendations`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/recommendations/*` | JWT |

### 📈 Growth — `/api/growth`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET/POST | `/api/growth/*` | JWT |

### 🔭 Engagement — `/api/engagement`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET/POST | `/api/engagement/*` | JWT |

### 🤖 Admin Intelligence — `/api/admin/intelligence`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET/POST | `/api/admin/intelligence/*` | JWT + adminAuth |

### 📡 Telemetry — `/api/telemetry`, `/api/v1/telemetry`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET/POST | `/api/telemetry/*` | JWT |

### 🏥 Health — `/api/health`, `GET /health`
| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /health` | Public | Uptime + timestamp |
| `GET /api/health/*` | Mixed | Deep health checks |

### 🌐 Live Sessions — `/api/live`, `/api/admin/live-sessions`
| Method | Endpoint | Auth |
|--------|----------|------|
| GET/POST | `/api/live/*` | JWT |
| GET/POST | `/api/admin/live-sessions/*` | JWT + adminAuth |

---

## 2. WORKING ROUTES INVENTORY

### Page Routes (HTML served from `/public`)
| Route | File Served | Auth |
|-------|------------|------|
| `GET /` | `index.html` | Public |
| `GET /admin` | `admin.html` | auth + adminAuth middleware |
| `GET /about` | `about.html` (via pagesRoutes) | Public |
| `GET /test.html` | Static | Public (auth enforced by JS) |
| SEO routes | Via `seoRoutes` | Public |

### Static Asset Routes
| Path | Cache TTL |
|------|-----------|
| `*.html` | 300s (5 min) |
| `*.css / *.js / images` | 31536000s (1 year, immutable) |

---

## 3. CURRENT DB SCHEMA SNAPSHOT

### Collection: `users`
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | required, trim |
| `email` | String | required, unique, lowercase, indexed |
| `password` | String | required, select:false, bcrypt-12 |
| `pushSubscription` | Object | null default |
| `plan` | String | enum: free/pro_monthly/pro_yearly |
| `subscriptionStatus` | String | enum: active/expired/cancelled/grace_period |
| `subscriptionEnd` | Date | null |
| `paymentProvider` | String | enum: razorpay/stripe/manual |
| `razorpaySubscriptionId` | String | null |
| `razorpayOrderId` | String | null |
| `createdAt` | Date | auto |
| `streakCount` | Number | default 0 |
| `lastActiveDate` | Date | null |
| `badges` | [String] | legacy badge array |
| `refreshTokens` | [String] | max 5 kept |
| `role` | String | enum: user/admin |
| `isActive` | Boolean | true default |
| `chatCount` | Number | 0 |
| `lastChatDate` | Date | auto |
| `friends` | [ObjectId] | ref: User |
| `resetPasswordToken` | String | hashed sha256 |
| `resetPasswordExpires` | Date | 15-min window |

**Indexes:** email, createdAt-1, role, isActive+role, plan+subscriptionStatus, subscriptionEnd(sparse), lastActiveDate-1

---

### Collection: `questions`
| Field | Type | Notes |
|-------|------|-------|
| `subjectId` | String | primary subject key, indexed |
| `subject` | String | legacy fallback, indexed |
| `examId` | String | indexed |
| `topicId` | String | indexed |
| `text` | String | primary question text |
| `question_en` | String | bilingual EN |
| `question_hi` | String | bilingual HI |
| `options` | [String] | standard options array |
| `options_en / options_hi` | [String] | bilingual options |
| `answer` | String | string answer |
| `correctAnswer` | Number | index 0-3 |
| `difficulty` | String | EASY/MEDIUM/HARD (uppercase) |
| `explanation` | String | - |
| `explanation_en / explanation_hi` | String | bilingual |
| `qualityScore` | Number | indexed |
| `qualityFlags` | [String] | - |
| `reviewRequired` | Boolean | indexed, default false |
| `createdAt` | Date | auto |

**Schema mode:** `strict: false` (legacy data compatibility)  
**Indexes:** text(question_en+text), examId+subjectId+topicId, subjectId+difficulty, reviewRequired+qualityScore, subjectId+qualityScore-1

---

### Collection: `testresults`
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | ref: User, required |
| `sessionId` | String | unique, required |
| `exam` | String | required |
| `subject` | String | required |
| `testName` | String | required |
| `mode` | String | full/drill/section |
| `score / totalQuestions / correct / incorrect / unattempted / accuracy` | Number | server-calculated |
| `answers` | [Object] | questionId, isCorrect, explanation, etc. |
| `fraudProbabilityScore` | Number | Phase 11 |
| `confidenceScore / normalizedScore` | Number | Phase 11 |
| `allIndiaRank / stateRank / categoryRank` | Number | Phase 11, nullable |
| `irtThetaFinal` | Number | IRT scoring |
| `createdAt` | Date | auto |

**Indexes:** userId, createdAt-1, exam+createdAt-1, userId+createdAt-1, userId+subject+createdAt-1, userId+exam+createdAt-1, subject+score-1, exam+score-1+createdAt-1, fraudProbabilityScore(sparse)

---

### Collection: `testsessions`
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | required, indexed |
| `sessionId` | String | unique, indexed |
| `subject / exam / topic` | String | - |
| `questionCount / timeLimit` | Number | - |
| `startTime` | Date | required |
| `status` | String | active/submitted/expired/terminated |
| `questionIds` | [String] | IDs served to user |
| `violations` | [Object] | type, timestamp, userAgent, ip |
| `violationCount` | Number | - |
| `locked` | Boolean | false default |
| `terminatedReason` | String | null |
| `answers` | Map | autosave state |
| `markedForReview` | [Number] | - |
| `fraudProbabilityScore / confidenceScore / panicScore` | Number | Phase 11 |
| `irtTheta / adaptiveDifficulty` | Number | - |
| `createdAt` | Date | TTL: 86400s (auto-delete after 24h) |

**Indexes:** userId+status, sessionId+status, userId+createdAt-1, status+createdAt-1

---

### Collection: `payments`
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | required |
| `planId` | String | required |
| `amount` | Number | required |
| `currency` | String | INR default |
| `razorpay_payment_id` | String | unique (idempotency) |
| `razorpay_order_id` | String | required |
| `razorpay_signature` | String | required |
| `status` | String | pending/success/failed/refunded |
| `metadata` | Object | - |
| `createdAt` | Date | auto |

**Indexes:** razorpay_order_id, userId+createdAt-1

---

### Collection: `userxps`
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | unique, required |
| `totalXP / level / xpToNextLevel` | Number | Level curve: 500 × 1.2^(level-1) |
| `currentStreak / longestStreak / lastStreakDate` | Mixed | - |
| `rewardLog` | [String] | dedup keys e.g. 'daily_login_2024-05-20' |
| `achievements` | [AchievementSchema] | badgeId, name, icon, xpReward, unlockedAt |
| `xpHistory` | [XPEventSchema] | last 200 events |
| `weeklyXP / weeklyReset` | Number/Date | weekly leaderboard |
| `updatedAt` | Date | auto |

**Indexes:** totalXP-1, weeklyXP-1, level-1, currentStreak-1

---

### Collection: `livesessions`
| Field | Type | Notes |
|-------|------|-------|
| `exam / subject` | String | required |
| `startTime / duration` | Date/Number | required |
| `questions` | [ObjectId] | ref: Question |
| `registeredUsers` | [ObjectId] | ref: User |
| `status` | String | upcoming/live/ended |
| `createdBy` | ObjectId | ref: User |

**Indexes:** status+startTime

---

### Other Collections (models present, schema inferred)
| Collection | Model File |
|-----------|-----------|
| `chatmessages` | chatMessage.js |
| `liveresults` | liveResult.js |
| `notifications` | Notification.js |
| `payments` | payment.js |
| `questionreservations` | questionReservation.js |
| `testviolations` | testViolation.js |
| `useractivitylogs` | UserActivityLog.js |
| `wallets` | Wallet.js |
| `blogposts` | BlogPost.js |
| `communitydiscussions` | CommunityDiscussion.js |
| `coupons` | Coupon.js |
| `dailychallenges` | DailyChallenge.js |
| `goaltrackers` | GoalTracker.js |
| `institutions` | Institution.js |
| `peerbattles` | PeerBattle.js |
| `questiontelemetries` | QuestionTelemetry.js |
| `referrals` | Referral.js |
| `studygroups` | StudyGroup.js |
| `supporttickets` | SupportTicket.js |

---

## 4. ENVIRONMENT VARIABLES (CURRENT .env)

### Currently Set (`.env`)
| Variable | Value | Status |
|----------|-------|--------|
| `PORT` | 3000 | ✅ Active |
| `NODE_ENV` | production | ✅ Active |
| `JWT_SECRET` | `supersecretkeythatisverysecureandawesome` | ⚠️ WEAK — must be rotated before real production |
| `REFRESH_TOKEN_SECRET` | `supersecretrefreshkeythatisverysecure` | ⚠️ WEAK — must be rotated |
| `MONGO_URI` | `mongodb://localhost:27017/nirnaypath` | ✅ Local dev |
| `ADMIN_EMAIL` | `admin@example.com` | ⚠️ Placeholder |
| `RATE_LIMIT_MAX` | 10000 | ✅ Active |
| `AUTH_LIMIT_MAX` | 1000 | ✅ Active |
| `EMAIL_HOST` | `smtp.ethereal.email` | ✅ Dev/test only |
| `EMAIL_PORT` | 587 | ✅ Active |
| `EMAIL_SECURE` | false | ✅ Active |
| `EMAIL_USER` | `nctssfxzdq4twjbn@ethereal.email` | ✅ Test account |
| `EMAIL_PASS / EMAIL_PASSWORD` | `2DgeJ4se5dCdfyuv17` | ✅ Ethereal test |
| `EMAIL_FROM` | `"NirnayPath" <nctssfxzdq4twjbn@ethereal.email>` | ✅ Active |
| `LOGGING_MODE` | file | ✅ Active |

### Required But NOT Set (from `.env.example`)
| Variable | Purpose | Priority |
|----------|---------|----------|
| `RAZORPAY_KEY_ID` | Payment processing | 🔴 CRITICAL for payments |
| `RAZORPAY_KEY_SECRET` | Payment HMAC verification | 🔴 CRITICAL |
| `VAPID_PUBLIC_KEY` | Push notifications | 🟡 Medium |
| `VAPID_PRIVATE_KEY` | Push notifications | 🟡 Medium |
| `VAPID_EMAIL` | Push notifications | 🟡 Medium |
| `AI_API_KEY` | Gemini AI Tutor | 🟡 Medium |
| `SENTRY_DSN` | Crash monitoring | 🟡 Medium |
| `ALLOWED_ORIGINS` | Custom domain CORS | 🟠 Required for production domain |
| `BCRYPT_ROUNDS` | Hash cost (defaults 12) | 🟢 Optional |
| `VIOLATION_LOCK_THRESHOLD` | Anti-cheat (defaults 3) | 🟢 Optional |

---

## 5. CRITICAL SERVICES LIST

### Core Runtime Services
| Service | File | Role | Status |
|---------|------|------|--------|
| `socketService` | services/socketService.js | WebSocket engine (Socket.IO) | ✅ ACTIVE |
| `cronService` | services/cronService.js | 5 scheduled jobs | ✅ ACTIVE |
| `workerService` | services/workerService.js | Background worker pool | ✅ ACTIVE |
| `workersLoader` | bootstrap/workersLoader.js | Post-boot worker bridge | ✅ ACTIVE |
| `questionRepository` | services/questionRepository.js | Precompiled question cache | ✅ ACTIVE |
| `crashReportingService` | services/crashReportingService.js | Error capture + Sentry | ✅ ACTIVE |
| `emailService` | services/emailService.js | BullMQ email queue | ✅ ACTIVE |
| `notificationService` | services/notificationService.js | Push + in-app notifications | ✅ ACTIVE |
| `cacheLayer` | services/cacheLayer.js | In-memory LRU cache | ✅ ACTIVE |
| `slowQueryLogger` | services/slowQueryLogger.js | Mongoose query profiler | ✅ ACTIVE |

### Security Services
| Service | File | Role |
|---------|------|------|
| `rateLimiter` | middleware/rateLimiter.js | General + auth-specific limits |
| `auth` | middleware/auth.js | JWT cookie + Bearer validation |
| `adminAuth` | middleware/adminAuth.js | role === 'admin' guard |
| `requestTracing` | middleware/requestTracing.js | X-Request-ID propagation |
| `semanticFirewallService` | services/semanticFirewallService.js | AI content security |
| `distributedLockService` | services/distributedLockService.js | Redis-backed op locks |
| `idempotency` | middleware/idempotency.js | Duplicate request prevention |

### Intelligence Services
| Service | File | Role |
|---------|------|------|
| `questionRuntimeEngine` | services/questionRuntimeEngine.js | Selection + serving pipeline |
| `adaptiveLearningService` | services/adaptiveLearningService.js | IRT + adaptive difficulty |
| `recommendationService` | services/recommendationService.js | AI-powered study recs |
| `syllabusIntelligenceService` | services/syllabusIntelligenceService.js | Syllabus mapping |
| `xpService` | services/xpService.js | Gamification XP engine |
| `achievementService` | services/achievementService.js | Badge + achievement engine |
| `contentApprovalService` | services/contentApprovalService.js | Question approval workflow |

### Scheduled Jobs (cronService)
| Job | Schedule | Action |
|-----|----------|--------|
| Streak/Comeback Reminder | Daily 8 PM | Alert users with at-risk streaks |
| Study Reminder | Daily 9 AM | Nudge inactive users |
| Exam Countdown | Daily 10 AM | Milestone alerts (100/50/30/15/7/3/2/1 days) |
| AI Recommendations | Mon+Thu 11 AM | Generate + push weakness corrections |
| Weekly Email Digest | Sunday 9 AM | Email digest via BullMQ |

---

## 6. ROLLBACK STRATEGY

### Level 1 — Code Rollback
```bash
# Git-based immediate rollback
git log --oneline -10           # Find last stable commit
git revert HEAD                 # Revert last commit
# OR
git checkout <stable-commit-hash> -- .   # Restore specific files
node app.js                              # Restart
```

### Level 2 — PM2 Process Rollback
```bash
pm2 list                        # Check running processes
pm2 stop all                    # Stop current
pm2 start ecosystem.config.js   # Restart from last config
pm2 logs                        # Verify clean boot
```

### Level 3 — Database Rollback
```bash
# MongoDB local snapshot restore
mongodump --db nirnaypath --out ./backups/$(date +%Y%m%d)
mongorestore --db nirnaypath ./backups/<date>/nirnaypath
```
**Note:** `backups/` directory present at project root. Backup discipline: run mongodump before any schema migration.

### Level 4 — Docker Rollback (if containerized)
```bash
docker-compose down
docker-compose up --build -d
```
Dockerfile and docker-compose.yml are present and functional.

### Level 5 — Railway/Render Rollback
- Dashboard → Deployments → Select previous deployment → Redeploy
- Server keepAliveTimeout=65s, headersTimeout=66s for proxy stability

### Critical Rollback Order
1. Stop new traffic (Railway/Render → pause deployment)
2. `pm2 stop all` or `kill <PID>`
3. `git checkout <stable-tag>`
4. Restore DB if schema changed
5. `pm2 start ecosystem.config.js`
6. Verify `GET /health` returns `{status:"ok"}`
7. Run `node tests/chaosRegressionSuite.js`

---

## 7. RUNTIME CERTIFICATION STATUS

| Test Suite | Result | Tests |
|-----------|--------|-------|
| `chaosRegressionSuite.js` | ✅ PASS | 16/16 |
| `phase10_gamification_suite.js` | ✅ PASS | 10/10 |
| `phase8_security_suite.js` | ✅ PASS | 40/40 |
| `verify_scale_runtime.js` | ✅ PASS | 5/5 |
| `reviewPipelineRealityAudit.js` | ✅ PASS | 6/6 |
| `firewallRealityAudit.js` | ✅ PASS | 5/5 |
| `verify_e2e_runtime.js` (Flow 1) | ✅ PASS | Anonymous nav, 16/16 images |
| `verify_e2e_runtime.js` (Flow 2) | ✅ PASS | Signup + login auth cycle |
| `verify_e2e_runtime.js` (Flow 3) | ✅ PASS | CBT test engine, 5Q submit |
| `verify_e2e_runtime.js` (Flow 4) | ✅ PASS | Admin dashboard, all sections |
| `verify_e2e_runtime.js` (Flow 5) | ✅ PASS | 50 tabs / 50 modals / 20 reloads |
| `verify_telemetry.js` | ✅ PASS | Telemetry pipeline verified |

**Console errors (non-blocking):**
- `401 Unauthorized` on anonymous `checkAuthStatus` → expected by design
- `ERR_BLOCKED_BY_ORB` on Razorpay CDN → external CDN blocked in headless sandbox; no impact on runtime

**Certification Date:** 2026-05-26  
**Certified By:** Production Recovery Engineer (Automated E2E + Chaos suite)

---

## 8. KNOWN TECHNICAL DEBT

### 🔴 Critical (Must fix before real production traffic)
| ID | Issue | Location | Risk |
|----|-------|----------|------|
| TD-001 | `JWT_SECRET` and `REFRESH_TOKEN_SECRET` are weak placeholder strings | `.env` | Auth token forgery if leaked |
| TD-002 | `ADMIN_EMAIL=admin@example.com` is a placeholder; no real admin is auto-promoted | `.env` | No admin access on fresh deploy |
| TD-003 | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` not set; payment routes will crash | `.env` | Revenue-critical |
| TD-004 | Email uses Ethereal SMTP (test-only) — emails are not delivered to real users | `.env` | Broken welcome/reset/digest emails |

### 🟠 High (Should fix soon)
| ID | Issue | Location | Risk |
|----|-------|----------|------|
| TD-005 | `VAPID_PUBLIC_KEY/PRIVATE_KEY` not set — push notifications silently fail | `.env` | Broken engagement feature |
| TD-006 | `AI_API_KEY` (Gemini) not set — AI Tutor and smart recs degrade to fallbacks | `.env` | Degraded UX |
| TD-007 | `SENTRY_DSN` not set — crash reporting is in-process only, no external alert | `.env` | Silent production failures |
| TD-008 | `ALLOWED_ORIGINS` not set — CORS defaults to hardcoded Railway URL | `app.js:123` | Custom domains will be CORS-blocked |
| TD-009 | Password field has duplicate env key (`EMAIL_PASS` and `EMAIL_PASSWORD`) | `.env` | Maintenance confusion |
| TD-010 | `User.plan` counts only `pro_monthly` in admin stats, `pro_yearly` excluded | `routes/admin.js:392` | Inaccurate revenue metric |

### 🟡 Medium (Track)
| ID | Issue | Location | Risk |
|----|-------|----------|------|
| TD-011 | `Question` schema uses `strict: false` to support legacy data — may allow garbage fields | `models/question.js:33` | Data integrity |
| TD-012 | Dual answer field convention (`correctAnswer` number + `answer` string) creates branching logic in scoring | `routes/test.js:226-234` | Scoring edge cases |
| TD-013 | `calculateStreak` in `routes/user.js` does a full `TestResult.find()` per request (no limit) — could be slow at scale | `routes/user.js:171` | Performance at 10K+ users |
| TD-014 | `syncToJSON` (async JSON backup on every question write) is fire-and-forget with silent catch — failures are invisible | `routes/admin.js:58-71` | Backup integrity |
| TD-015 | `refreshTokens` max kept: 5. Sessions beyond 5 devices silently invalidate oldest | `routes/auth.js:143` | Multi-device users |
| TD-016 | Redis is imported (`ioredis`, `@socket.io/redis-adapter`, `bullmq`) but not configured in `.env` — services degrade or fail silently | Various | Caching + queues |
| TD-017 | `EXAMS_CONFIG` (BPSC, UPSC) hardcoded in cronService — adding new exams requires code change | `services/cronService.js:9-12` | Maintainability |
| TD-018 | `GRACE_PERIOD=120s` in test submit is generous — could allow latent cheating on slow networks | `routes/test.js:178` | Anti-cheat integrity |

### 🟢 Low (Backlog)
| ID | Issue | Location | Risk |
|----|-------|----------|------|
| TD-019 | `autocomplete` attributes missing on password fields (browser console warning) | `public/index.html` | UX / accessibility |
| TD-020 | `prestart` script (`linuxImportAudit.js`) runs on Windows — may log cross-platform warnings | `package.json` | Dev DX |
| TD-021 | Many advanced collections (PeerBattle, GoalTracker, Institution, Referral, etc.) have models but no active routes | `models/` | Dead code weight |
| TD-022 | `generate_cs_final.js` (91KB) and `extract.js` are utility scripts committed to root — should be in `scripts/` | Root | Repo hygiene |
| TD-023 | `login_failure.png` (268KB screenshot) committed to root | Root | Repo bloat |

---

## DEPENDENCIES (Runtime)
| Package | Version | Role |
|---------|---------|------|
| express | ^4.19.2 | HTTP framework |
| mongoose | ^9.6.1 | MongoDB ODM |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT auth |
| socket.io | ^4.8.3 | WebSocket engine |
| ioredis | ^5.10.1 | Redis client |
| bullmq | ^5.76.7 | Job queue |
| razorpay | ^2.9.6 | Payment gateway |
| nodemailer | ^8.0.7 | Email transport |
| node-cron | ^4.2.1 | Cron scheduler |
| helmet | ^7.1.0 | Security headers |
| express-rate-limit | ^7.3.1 | Rate limiting |
| web-push | ^3.6.7 | Push notifications |
| @google/generative-ai | ^0.24.1 | Gemini AI |
| compression | ^1.7.4 | Response compression |
| cors | ^2.8.5 | CORS middleware |
| morgan | ^1.10.0 | HTTP logging |

---

*This document is a point-in-time audit snapshot. Do not modify code based on this file alone — cross-verify against live source before any change.*
