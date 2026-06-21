# NirnayPath 2.0 Removal Report

This document records the architectural bloat removed from the codebase during Phase 1.

---

## 1. Summary of Removed Services & Systems

### 1.1 Redis & Queues
- **bullmq & ioredis**: Removed complete distributed task queue infrastructure.
- **Workers**: Deleted weekly digest compiling, email processing, telemetry stream flushing, and AI performance threads.
- **Locking**: Removed Redis-backed mutex locks (`distributedLockService.js`).

### 1.2 Generative AI Tutor
- **AI Tutoring Services**: Deleted tutor explanation generator, hints builder, and concept summarizer.
- **Planner**: Deleted dynamic study planner services.

### 1.3 Gamification & Growth Widgets
- **UserXP & Badges**: Deleted achievements, streaks, levels, milestone awards, and user badges.
- **Wallet & Coupons**: Deleted wallets, transactions, coupon systems, and referrals.
- **Community Modules**: Deleted study groups, peer battles, discussions, and live sessions.

### 1.4 Telemetry & Sentry
- **Sentry**: Removed crash reporting trackers.
- **Logging**: Removed slow query loggers, request tracing IDs, and telemetry stream routers.

---

## 2. Deleted Files Log

- **Directories Deleted**:
  - `bootstrap/` (workers registration)
  - `internal/` (telemetry control panels, stubs)
  - `workers/` (background thread processors)

- **Models Deleted**:
  - `models/BlogPost.js`
  - `models/CommunityDiscussion.js`
  - `models/Coupon.js`
  - `models/DailyChallenge.js`
  - `models/GoalTracker.js`
  - `models/Institution.js`
  - `models/Notification.js`
  - `models/PeerBattle.js`
  - `models/QuestionTelemetry.js`
  - `models/Referral.js`
  - `models/StudyGroup.js`
  - `models/SupportTicket.js`
  - `models/UserActivityLog.js`
  - `models/UserXP.js`
  - `models/Wallet.js`
  - `models/chatMessage.js`
  - `models/liveResult.js`
  - `models/liveSession.js`
  - `models/payment.js`
  - `models/testViolation.js`

- **Services Deleted**:
  - 60+ unused or bloated services under `services/` (see `PROJECT_FORENSIC_AUDIT.md` for full list).

- **Routes Deleted**:
  - All routers under `routes/` except `pages.js`, `auth.js`, `test.js`, `admin.js`, and `learning.js`.

- **Frontend JS Deleted**:
  - All public client scripts except `app.js`, `auth.js`, `learn.js`, `mock-tests.js`, `dashboard.js`, and `admin.js`.

- **Frontend Pages Deleted**:
  - `live-leaderboard.html`, `mobile-app-shell.html`, `national-status.html`, `notification-center.html`, `performance-intelligence.html`, `reset-password.html`, `review-admin.html`, `test.html`, `trust-center.html`.
