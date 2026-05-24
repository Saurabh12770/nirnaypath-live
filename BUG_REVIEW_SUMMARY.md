# NirnayPath Project — Bug Review Summary

## Overview
A thorough review of the NirnayPath codebase (Node.js/Express/Mongoose EdTech platform) was conducted across all layers: middleware, routes, models, services, scripts, and the main entry point. Below is a categorized list of all bugs found, ranked by severity.

---

## 🔴 CRITICAL BUGS (Will cause runtime crashes or data loss)

### BUG-1: `user` Model Missing `refreshTokens` Field — Refresh Tokens Never Persisted
- **Files:** [`models/user.js`](models/user.js) vs. [`routes/auth.js`](routes/auth.js:129)
- **Problem:** [`routes/auth.js`](routes/auth.js:129) writes `user.refreshTokens = [...]` and calls `user.save()`, but the Mongoose schema in [`models/user.js`](models/user.js) has **no `refreshTokens` field**. Mongoose silently strips unknown fields on save. All refresh tokens are **never persisted**, meaning:
  - The `/refresh-token` endpoint at [`routes/auth.js:157`](routes/auth.js:157) will **never find a user** (queries `{ refreshTokens: refreshToken }` against a field that doesn't exist in the DB).
  - The `/logout` endpoint at [`routes/auth.js:191`](routes/auth.js:191) similarly breaks.
- **Fix:** Add `refreshTokens: [String]` to the User schema.

### BUG-2: `emailService.sendEmail()` Signature Mismatch — Payment/Subscription Emails Crash
- **Files:** [`services/emailService.js:34`](services/emailService.js:34) vs. [`services/subscriptionService.js:51`](services/subscriptionService.js:51)
- **Problem:** `sendEmail` is defined as `async (type, payload)` (2 args), but [`subscriptionService.js:51`](services/subscriptionService.js:51) and [`subscriptionService.js:106`](services/subscriptionService.js:106) call it as `sendEmail(user.email, 'PAYMENT_SUCCESS', {...})` (3 args). The first argument becomes `type`, so it receives a raw email string. It falls to the `default` case and throws `"Invalid email type: user@example.com"`.
- **Fix:** `sendEmail` should accept `(to, type, context)` — or subscriptionService should call it with the correct 2-arg `(type, { user, ...otherData })` signature.

### BUG-3: Webhook Raw Body Middleware Conflicts with `express.json()` — All Webhooks Silently Fail
- **Files:** [`app.js:124-143`](app.js:124) and [`routes/payment.js:154`](routes/payment.js:154)
- **Problem:** The custom middleware at [`app.js:124`](app.js:124) consumes the request stream (listens to `data`/`end` events) to capture `req.rawBody`. It then calls `next()`, which reaches `express.json()` at [`app.js:143`](app.js:143). Since the stream is already consumed, `express.json()` sees an empty stream and **overwrites `req.body` with `{}`**. The webhook handler at [`routes/payment.js:176`](routes/payment.js:176) destructures `{ event, payload }` from `req.body` — getting `undefined, undefined`. No webhook events are ever processed.
- **Fix:** When the path matches the webhook route, skip `express.json()` entirely for that request (e.g., using a conditional middleware chain). The custom middleware already parses `req.body` at line 132.

### BUG-4: `auth` Middleware Calls `process.exit(1)` Inside a Request Handler
- **File:** [`middleware/auth.js:34-35`](middleware/auth.js:34)
- **Problem:** If `JWT_SECRET` is missing at request time, the middleware calls `process.exit(1)`, crashing the entire server on a single request. This should only be a startup check, not a per-request fatal error.
- **Fix:** Move the `JWT_SECRET` check to module-load time (like [`routes/auth.js:12-14`](routes/auth.js:12) does) and return 500 to the client instead of killing the process.

### BUG-5: `emailMetrics.js` Crashes When Redis Is Unavailable
- **Files:** [`services/emailMetrics.js:1`](services/emailMetrics.js:1)
- **Problem:** `const { connection } = require('./queueService')` returns a getter that resolves to `getRedisClient()`. If Redis isn't configured, this is `null`. Then [`emailMetrics.js:5`](services/emailMetrics.js:5) calls `connection.hincrby(...)` on `null` → **TypeError crash**. The `try/catch` silently swallows errors, but the bigger issue is that `getMetrics()` at line 13 similarly crashes with `connection.hgetall(...)` on `null`.
- **Fix:** Guard against `null` connection before calling Redis methods.

---

## 🟠 HIGH SEVERITY (Logic errors with significant impact)

### BUG-6: `planGuard.js` — Pro Users Bypass All Feature Gates Regardless of Subscription Status
- **File:** [`middleware/planGuard.js:40-41`](middleware/planGuard.js:40)
- **Problem:** If `userPlan !== 'free'`, the middleware returns `next()` immediately at line 41. This happens **before** checking `subscriptionStatus`. A user with `plan: 'pro_monthly'` but `subscriptionStatus: 'cancelled'` or `'expired'` would still pass all `sectional_tests` and `advanced_analytics` gates.
- **Fix:** Move the `next()` on line 41 to after confirming `subscriptionStatus === 'active'`.

### BUG-7: `test.js` — Non-Atomic Double-Submission Race Condition
- **File:** [`routes/test.js:124-267`](routes/test.js:124)
- **Problem:** The submission endpoint checks `status: 'active'` at line 124-128, then performs ~140 lines of score calculation, gamification, etc., before finally doing an atomic `findOneAndUpdate` at line 258. Two concurrent requests can both pass the initial status check and both create results, badges, XP, etc.
- **Fix:** Use the atomic `findOneAndUpdate` (with status transition) as the **first** operation, and proceed only if it succeeds (i.e., this process was the one that transitioned the status).

### BUG-8: `live.js` — No Duplicate Submission Check for Live Tests
- **File:** [`routes/live.js:80-88`](routes/live.js:80)
- **Problem:** Creates a new `LiveResult` without checking if one already exists for the `userId + liveSessionId` combination. Users can submit multiple times and inflate leaderboard scores.
- **Fix:** Add a unique compound index on `{ userId, liveSessionId }` in `LiveResult` model, or check before insert.

### BUG-9: `live.js` — No Time-Expiry Check on Live Test Submission
- **File:** [`routes/live.js:59-66`](routes/live.js:59)
- **Problem:** Only checks `session.status !== 'live'`. Does not verify whether the session's time window (`startTime + duration`) has elapsed. Users can submit after time expires if the session status hasn't yet been updated by a cron/admin.
- **Fix:** Compute `endTime = session.startTime.getTime() + session.duration * 60000` and reject submissions after that time.

### BUG-10: `/api/health/env-audit` — Exposes Sensitive Configuration Without Authentication
- **File:** [`routes/health.js:352`](routes/health.js:352)
- **Problem:** The `GET /api/health/env-audit` endpoint has NO auth middleware. It exposes all environment variable names, their presence status, and length of secret values (e.g., JWT_SECRET length, REDIS_URL length). This is a reconnaissance goldmine for attackers.
- **Fix:** Add `auth` and `adminAuth` middleware to this route.

### BUG-11: `test.js` — Score Calculation Uses Index-Based Answer Mapping (Fragile)
- **File:** [`routes/test.js:175-176`](routes/test.js:175)
- **Problem:** `answers[index]` maps answers to questions by array index. If the frontend sends answers keyed by `questionId` (as an object/map, which is common for out-of-order answering), all answers would be mismatched to the wrong questions, producing incorrect scores.
- **Fix:** Accept answers as a `{ [questionId]: userChoice }` map in addition to (or instead of) an array.

### BUG-12: `subscriptionService.js` — `endSession()` Called Inside `finally` After `withTransaction()`
- **File:** [`services/subscriptionService.js:64-65`](services/subscriptionService.js:64)
- **Problem:** `withTransaction()` manages the session lifecycle internally (including ending it). Calling `session.endSession()` in the `finally` block after `withTransaction()` has already ended the session can cause unexpected behavior or errors in Mongoose.
- **Fix:** Remove the `finally` block entirely; `withTransaction` handles cleanup.

---

## 🟡 MEDIUM SEVERITY (Behavioral issues, edge cases, technical debt)

### BUG-13: `auth.js` Middleware Masks All Error Types as 401
- **File:** [`middleware/auth.js:47-48`](middleware/auth.js:47)
- **Problem:** All caught errors (DB down, jwt malformed, server error) return `401 { error: 'Please authenticate.' }`. A DB connection error (503) or malformed token (400) should return different status codes.
- **Fix:** Differentiate error types in the catch block.

### BUG-14: `idempotency.js` — Local Fallback Map Never Pruned (Memory Leak)
- **File:** [`middleware/idempotency.js:164-167`](middleware/idempotency.js:164)
- **Problem:** The `_localIdempotency` Map has entries added but no periodic cleanup. Expiry is checked only on read (line 139). Entries that are never re-read accumulate indefinitely, causing a memory leak under high traffic when Redis is unavailable.
- **Fix:** Add a `setInterval` cleanup similar to [`middleware/rateLimiter.js:24-31`](middleware/rateLimiter.js:24).

### BUG-15: `rateLimiter.js` — TOCTOU Race on Redis `INCR` + `EXPIRE`
- **File:** [`middleware/rateLimiter.js:75-77`](middleware/rateLimiter.js:75)
- **Problem:** Between `redis.incr(key)` returning 1 and `redis.expire(key, windowSeconds)`, the key could be deleted (e.g., Redis restart, eviction). This leaves a key with no TTL, permanently counting against the user.
- **Fix:** Use a Lua script or `multi()` to atomically INCR + EXPIRE.

### BUG-16: `rateLimiter.js` — `parseInt` Returns `NaN` When Env Var Is Empty/Non-Numeric
- **File:** [`middleware/rateLimiter.js:139`](middleware/rateLimiter.js:139)
- **Problem:** `parseInt(process.env.RATE_LIMIT_MAX || '100')` returns `NaN` if the env var is set to an empty string `''` (since `'' || '100'` → `'100'`, this case is OK), but if set to a non-numeric string like `'abc'`, `parseInt('abc')` is `NaN`. Since `NaN > currentCount` is always `false`, ALL requests would be blocked with 429.
- **Fix:** Use `const max = parseInt(process.env.RATE_LIMIT_MAX, 10); if (isNaN(max) || max <= 0) max = 100;`

### BUG-17: `test.js` — Duplicate `/health` Route Definitions
- **File:** [`routes/test.js:29`](routes/test.js:29) and [`routes/test.js:472`](routes/test.js:472)
- **Problem:** Two `router.get('/health', ...)` handlers are registered. The second silently overwrites the first in Express. The first handler returns `{ status: 'active', timestamp }`; the second returns `{ ok: true, timestamp }`. Frontend clients relying on the first shape would break.
- **Fix:** Remove one of the duplicate definitions.

### BUG-18: `cronService.js` — Exam Countdown Sends to ALL Users Every Day at Milestones
- **File:** [`services/cronService.js:92-103`](services/cronService.js:92)
- **Problem:** On milestone days (e.g., 100, 50, 30 days before exam), it fetches ALL active users and sends each an exam countdown notification — regardless of which exam they're preparing for. Users preparing for UPSC get BPSC countdown alerts and vice versa.
- **Fix:** Track user's target exam preference, or make the notification generic about "upcoming exams."

### BUG-19: `app.js` — Raw Body Middleware Path Matching Is Fragile
- **File:** [`app.js:125`](app.js:125)
- **Problem:** `req.path === '/api/payment/webhook'` uses exact string matching. If the route is ever mounted at a different base path or middleware order changes, this silently breaks. Also case-sensitive.
- **Fix:** Use `req.originalUrl` or a regex, or better yet, apply the raw body middleware only to the webhook route directly.

### BUG-20: `app.js` — Unused Imports (`cluster`, `os`)
- **File:** [`app.js:8-9`](app.js:8)
- **Problem:** `cluster` and `os` are imported but never used. Dead code.
- **Fix:** Remove the imports.

### BUG-21: `app.js` — MongoDB Connection Has No Timeout/Retry Configuration
- **File:** [`app.js:85`](app.js:85)
- **Problem:** `mongoose.connect(uri)` is called without `serverSelectionTimeoutMS`, `connectTimeoutMS`, or retry options. In production, transient network issues could cause connection failures with no backoff.
- **Fix:** Add connection options: `{ serverSelectionTimeoutMS: 5000, connectTimeoutMS: 10000, heartbeatFrequencyMS: 10000 }`.

### BUG-22: `planGuard.js` — Misleading Variable Name `startOfWeek`
- **File:** [`middleware/planGuard.js:48-49`](middleware/planGuard.js:48)
- **Problem:** `startOfWeek` is set to `new Date() - 7 days`, which is "7 days ago," not "start of the current week." The logic works correctly for a "last 7 days" window, but the variable name is misleading.
- **Fix:** Rename to `sevenDaysAgo`.

### BUG-23: `auth.js` Signup — JWT Returned in Response Body AND Cookie
- **File:** [`routes/auth.js:86-88`](routes/auth.js:86)
- **Problem:** The token is set as an `httpOnly` cookie (line 88) but is NOT included in the JSON response body (line 89 only returns `{ user: {...} }`). This is actually correct for httpOnly security — the token should only be in the cookie. However, the login route at [`routes/auth.js:135-137`](routes/auth.js:135) also only returns `{ user }` without the token in the body. The frontend must rely on cookies, which is fine for same-origin but problematic for mobile/PWA clients that can't read httpOnly cookies.
- **Fix:** Consider also returning the token in the response body for non-browser clients, or document the cookie-only approach clearly.

### BUG-24: `smokeTest.js` — Uses Dynamic `import('node-fetch')` — No `node-fetch` in Dependencies
- **File:** [`scripts/smokeTest.js:43`](scripts/smokeTest.js:43)
- **Problem:** Uses `fetch` (global in Node 18+) but the script file doesn't use dynamic import. On Node 18+, global `fetch` is available, so this should work. However, on older Node versions, this would fail. The Readme says "Node.js v18+" so this is acceptable.
- **Severity:** LOW (documented constraint).

---

## 🟢 LOW SEVERITY (Code quality, minor edge cases)

### BUG-25: `api.js` — `optionalAuth` Is Actually Mandatory Auth
- **File:** [`routes/api.js:7`](routes/api.js:7)
- **Problem:** `const optionalAuth = require('../middleware/auth')` imports the standard auth middleware which ALWAYS returns 401 on missing token. The variable name `optionalAuth` is misleading — there's no "optional" behavior.
- **Fix:** Either rename to `auth` or create a truly optional auth middleware that sets `req.user` only if a token is present.

### BUG-26: `api.js` — JWT Verification Catches All Errors Silently
- **File:** [`routes/api.js:50`](routes/api.js:50)
- **Problem:** `catch (_) { /* unauthenticated — proceed as guest */ }` — if JWT_SECRET is wrong/missing, `jwt.verify` throws, but the catch silently swallows it and proceeds as guest. This masks configuration errors.
- **Fix:** Log the error at debug level before proceeding as guest.

### BUG-27: `test.js:226` — Accuracy Calculation Guard (Minor)
- **File:** [`routes/test.js:226`](routes/test.js:226)
- **Problem:** `Math.round((calcCorrect / (calcCorrect + calcIncorrect || 1)) * 100)` — The `|| 1` prevents division by zero, but if someone answers 0 questions, `0 / 1 * 100 = 0%` which is technically correct. Fine as-is, but the intent could be clearer.

### BUG-28: `models/testSession.js:96` — MongoDB TTL Index `expires: 86400` Is in Seconds (24h)
- **File:** [`models/testSession.js:96`](models/testSession.js:96)
- **Problem:** `expires: 86400` means MongoDB will auto-delete documents 24 hours after `createdAt`. While intentional, sessions that are still active after 24h (e.g., long-running exams) would be silently deleted. This is more of a design consideration.
- **Severity:** LOW/DESIGN.

---

## 📊 SUMMARY TABLE

| # | Severity | Component | Issue |
|---|----------|-----------|-------|
| 1 | 🔴 CRITICAL | `models/user.js` + `routes/auth.js` | `refreshTokens` field missing from schema — tokens never saved |
| 2 | 🔴 CRITICAL | `services/emailService.js` + `services/subscriptionService.js` | `sendEmail()` signature mismatch — payment emails crash |
| 3 | 🔴 CRITICAL | `app.js` + `routes/payment.js` | Raw body middleware + `express.json()` conflict — webhooks never processed |
| 4 | 🔴 CRITICAL | `middleware/auth.js` | `process.exit(1)` inside request handler |
| 5 | 🔴 CRITICAL | `services/emailMetrics.js` | Null Redis connection crashes metrics endpoints |
| 6 | 🟠 HIGH | `middleware/planGuard.js` | Pro users bypass gates regardless of subscription status |
| 7 | 🟠 HIGH | `routes/test.js` | Non-atomic double-submission race condition |
| 8 | 🟠 HIGH | `routes/live.js` | No duplicate submission check for live tests |
| 9 | 🟠 HIGH | `routes/live.js` | No time-expiry check on live test submission |
| 10 | 🟠 HIGH | `routes/health.js` | `/env-audit` endpoint has no authentication |
| 11 | 🟠 HIGH | `routes/test.js` | Index-based answer mapping (fragile) |
| 12 | 🟠 HIGH | `services/subscriptionService.js` | `endSession()` after `withTransaction()` |
| 13 | 🟡 MEDIUM | `middleware/auth.js` | All errors masked as 401 |
| 14 | 🟡 MEDIUM | `middleware/idempotency.js` | Memory leak in local fallback Map |
| 15 | 🟡 MEDIUM | `middleware/rateLimiter.js` | TOCTOU race on INCR+EXPIRE |
| 16 | 🟡 MEDIUM | `middleware/rateLimiter.js` | NaN handling in limit parsing |
| 17 | 🟡 MEDIUM | `routes/test.js` | Duplicate `/health` route definitions |
| 18 | 🟡 MEDIUM | `services/cronService.js` | Exam countdown sent to all users regardless of exam |
| 19 | 🟡 MEDIUM | `app.js` | Fragile webhook path matching |
| 20 | 🟡 MEDIUM | `app.js` | Unused imports (`cluster`, `os`) |
| 21 | 🟡 MEDIUM | `app.js` | No MongoDB connection timeout options |
| 22 | 🟡 MEDIUM | `middleware/planGuard.js` | Misleading variable name `startOfWeek` |
| 23 | 🟡 MEDIUM | `routes/auth.js` | Token not returned in response body (mobile/PWA concern) |
| 24 | 🟢 LOW | `scripts/smokeTest.js` | Depends on Node 18+ global fetch |
| 25 | 🟢 LOW | `routes/api.js` | Misleading `optionalAuth` naming |
| 26 | 🟢 LOW | `routes/api.js` | Silent JWT error swallowing |
| 27 | 🟢 LOW | `models/testSession.js` | 24h TTL may delete active long-running sessions |

---

**Total: 27 bugs found** — 5 Critical, 7 High, 11 Medium, 4 Low