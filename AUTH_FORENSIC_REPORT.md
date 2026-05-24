# PHASE-4A AUTH FORENSIC REPORT
## Authentication + Session Integrity Stabilization Package

---

## FILES AUDITED

| File | Lines | Purpose |
|------|-------|---------|
| [`models/user.js`](models/user.js) | 107 | Mongoose User schema — canonical data shape |
| [`routes/auth.js`](routes/auth.js) | 295 | Authentication routes: signup, login, refresh, logout, password reset |
| [`middleware/auth.js`](middleware/auth.js) | 53 | JWT verification middleware — gate for protected routes |

No other auth utility files exist. [`utils/runtimeTrace.js`](utils/runtimeTrace.js) is referenced but is a logging tracer, not auth logic.

---

## BUG-1: `refreshTokens` Schema Mismatch — CONFIRMED 🔴

### Evidence

**Schema definition** — [`models/user.js:92-93`](models/user.js:92):
```js
resetPasswordToken: String,
resetPasswordExpires: Date
```
The schema has NO `refreshTokens` field. Every other string-array field (`badges`, `friends`) is explicitly declared. `refreshTokens` is absent.

**Write site** — [`routes/auth.js:129`](routes/auth.js:129):
```js
user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
await user.save();
```
This assigns to `user.refreshTokens` on the Mongoose document. Mongoose's `strict` mode (default: `true`) silently strips fields not in the schema during `save()`. The `|| []` fallback always evaluates to `[]` because `user.refreshTokens` is always `undefined` on a fresh query result (Mongoose doesn't populate non-schema fields).

**Read site (refresh)** — [`routes/auth.js:157`](routes/auth.js:157):
```js
const user = await User.findOne({ _id: decoded.id, refreshTokens: refreshToken });
```
This queries MongoDB for a document where the `refreshTokens` array contains the token. Since `refreshTokens` was never persisted, this query **always returns null**.

**Read site (logout)** — [`routes/auth.js:191`](routes/auth.js:191):
```js
const user = await User.findOne({ refreshTokens: refreshToken });
```
Same issue — always null.

### Root Cause
The `refreshTokens` field was added to route logic during development but never declared in the Mongoose schema. Mongoose's `strict: true` (default) discards undeclared fields on write. No runtime error is thrown; the data simply disappears.

### Affected Runtime Flow
```
User Login → JWT + Refresh Token generated → refreshTokens assigned → user.save() 
→ Mongoose strips refreshTokens (silent) → Document saved without refreshTokens
→ User tries /refresh-token → Query fails → 403 "Invalid refresh token"
→ User tries /logout → Query fails → Logout appears to work (cookies cleared anyway)
```
**Refresh token rotation is completely non-functional. Logout can only clear cookies but never invalidates server-side tokens.**

### Impact: CRITICAL
- Token refresh flow: 100% broken
- Logout revocation: 100% broken (never finds tokens to remove)
- Multiple-device sessions: impossible (can't track multiple refresh tokens)
- Security: refresh tokens can never be invalidated server-side

---

## BUG-4: `process.exit()` Inside Auth Middleware — CONFIRMED 🔴

### Evidence

**Location** — [`middleware/auth.js:32-36`](middleware/auth.js:32):
```js
const secret = process.env.JWT_SECRET;
if (!secret) {
    console.error('FATAL: JWT_SECRET missing');
    process.exit(1);
}
```

### Root Cause
The JWT_SECRET check is placed **inside the per-request handler** (lines 17-50), not at module load time. Every authenticated request enters this code path. If `process.env.JWT_SECRET` is somehow cleared or corrupted at runtime (e.g., memory pressure, env manipulation, race condition in cluster mode), the next authenticated request **kills the entire Node.js process with exit code 1**.

### Comparison with `routes/auth.js`
[`routes/auth.js:12-14`](routes/auth.js:12) does this correctly — at module load time:
```js
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production.');
  process.exit(1);
}
```
The route file exits at load time (before server starts). The middleware exits at request time (after server is running and serving traffic).

### Affected Runtime Flow
```
Server running → Incoming request → auth middleware → JWT_SECRET check fails 
→ process.exit(1) → Entire production server dies → Railway/K8s restarts container
→ During restart: ALL users disconnected, ALL active test sessions lost
```
This is a **single-request-triggered production outage vector**.

### Impact: CRITICAL
- Production availability: single point of catastrophic failure
- Any env corruption (even transient) = full server kill
- No graceful degradation — immediate exit with no cleanup

---

## BUG-13: Auth Middleware Error Masking — CONFIRMED 🟡

### Evidence

**Location** — [`middleware/auth.js:47-48`](middleware/auth.js:47):
```js
} catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
}
```

### Analysis of All Possible Error Types Caught

| Error Source | Actual Error Type | Correct HTTP Status | Current Behavior |
|---|---|---|---|
| No token in header/cookie | `Error('No token found')` | 401 | ✅ 401 |
| JWT expired | `TokenExpiredError` | 401 | ❌ 401 (same message, no `expired` hint) |
| JWT malformed | `JsonWebTokenError` | 400 | ❌ 401 (wrong status) |
| JWT wrong secret | `JsonWebTokenError` | 401 | ❌ 401 (no differentiation) |
| User deleted after token issued | `Error('User not found')` | 401 | ✅ 401 |
| MongoDB connection lost | `MongooseError` | 503 | ❌ 401 (critical infrastructure failure masked) |
| User.findById throws | Various | 500 | ❌ 401 (server error masked as auth failure) |

### Concrete Problem
A production monitoring system receiving only 401 "Please authenticate." across all endpoints cannot distinguish between:
- An expired token (client should refresh)
- A malformed token (client bug)
- The database being down (SRE alert needed)
- A server crash (incident response needed)

### Impact: MEDIUM
- Obscures production incidents behind a uniform 401
- Makes debugging token issues impossible without server logs
- Clients can't implement intelligent retry/refresh logic based on error type

---

## BUG-23: Cookie/Token Consistency Audit — PARTIALLY CONFIRMED 🟡

### Evidence

**Signup** — [`routes/auth.js:86-89`](routes/auth.js:86):
```js
const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
res.cookie('token', token, { httpOnly: true, secure: ..., sameSite: 'strict', maxAge: 3600000 });
res.status(201).json({ user: { name: user.name, email: user.email, role: user.role } });
```
- Token in cookie: ✅ YES
- Token in body: ❌ NO
- Refresh token in cookie: ❌ NO (not generated on signup)
- Refresh token in body: ❌ NO

**Login** — [`routes/auth.js:126-137`](routes/auth.js:126):
```js
const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
const refreshToken = jwt.sign({ id: user._id }, refreshTokenSecret, { expiresIn: '7d' });
user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
await user.save();
res.cookie('token', token, { httpOnly: true, ... });
res.cookie('refreshToken', refreshToken, { httpOnly: true, ... });
res.json({ user: { name: user.name, email: user.email, role: user.role } });
```
- Token in cookie: ✅ YES
- Token in body: ❌ NO
- Refresh token in cookie: ✅ YES
- Refresh token in body: ❌ NO

### Flow Analysis by Client Type

| Client Type | Cookie Access | Token Access | Refresh Token Access | Status |
|---|---|---|---|---|
| Browser (same-origin) | ✅ Automatic | Via cookie only | Via cookie only | ⚠️ WORKS (if cookies work) |
| Mobile WebView (same-origin) | ✅ Usually | Via cookie only | Via cookie only | ⚠️ WORKS (if cookies work) |
| Mobile PWA (standalone) | ⚠️ Unreliable | ❌ NO ACCESS | ❌ NO ACCESS | ❌ BROKEN |
| Mobile Native (fetch API) | ❌ None | ❌ NO ACCESS | ❌ NO ACCESS | ❌ BROKEN |
| Third-party API client | ❌ None | Via Authorization header | ❌ NO ACCESS | ❌ PARTIALLY BROKEN |

### Cookie Security Analysis

```js
{ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: ... }
```

| Setting | Value | Assessment |
|---|---|---|
| `httpOnly: true` | Always on | ✅ Correct (prevents XSS token theft) |
| `secure` | prod only | ⚠️ Should be `true` always in production; correct behavior |
| `sameSite: 'strict'` | Always strict | ⚠️ Blocks cross-site redirects (e.g., email verification links). `'lax'` is usually preferred for auth cookies that need to survive top-level navigations |
| `maxAge` | 3600000 (1h) for token, 604800000 (7d) for refresh | ✅ Correct |

### The Real Problem for Mobile/PWA

The `sameSite: 'strict'` cookie policy combined with `httpOnly: true` means:
1. PWAs running as standalone apps may not send cookies on fetch requests
2. Native mobile apps (React Native, Flutter) cannot use httpOnly cookies at all
3. Third-party integrations have no way to authenticate

The signup endpoint does NOT generate a refresh token, meaning new users cannot maintain sessions across page reloads without re-logging in.

### Impact: MEDIUM
- Browser-only design — mobile/native clients need tokens in response body
- Signup doesn't issue refresh token — session lost on tab close
- `sameSite: 'strict'` may break redirect flows (email verification, OAuth)

---

## ADDITIONAL FINDING: Signup Missing Refresh Token

### Evidence
[`routes/auth.js:86`](routes/auth.js:86) — Signup only generates an access token:
```js
const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
```
No refresh token is generated. Compare with login at line 126-127 which generates both.

### Impact
A user who signs up and closes their browser (or the 1-hour token expires) must log in again. There's no persistent session from signup. This is an inconsistent user experience — signup and login should produce identical token outputs.

---

## SUMMARY OF CONFIRMED BUGS

| Bug ID | Status | Severity | Root Cause |
|---|---|---|---|
| **BUG-1** | ✅ CONFIRMED | 🔴 CRITICAL | `refreshTokens` not declared in Mongoose schema — all writes silently dropped |
| **BUG-4** | ✅ CONFIRMED | 🔴 CRITICAL | `process.exit(1)` inside per-request middleware handler |
| **BUG-13** | ✅ CONFIRMED | 🟡 MEDIUM | Generic catch block masks all error types as 401 |
| **BUG-23** | ✅ PARTIALLY CONFIRMED | 🟡 MEDIUM | Tokens not in response body; no refresh token on signup; `sameSite: 'strict'` on auth cookies |
| **NEW** | ✅ CONFIRMED | 🟡 MEDIUM | Signup does not generate a refresh token — inconsistent with login flow |

## FALSE POSITIVES

None. All four target bugs (BUG-1, BUG-4, BUG-13, BUG-23) are confirmed real issues with concrete evidence.

---

## FIX PLAN (for STEP 2)

### Fix 1: `models/user.js` — Add `refreshTokens` field
Add `refreshTokens: [String]` to the schema (line after `badges`).

### Fix 2: `middleware/auth.js` — Move `process.exit` to module scope
Move JWT_SECRET check outside the handler function. Return 500 with descriptive error instead of killing process.

### Fix 3: `middleware/auth.js` — Differentiate error types
In the catch block, inspect `error.name` and `error.message` to return appropriate HTTP status codes.

### Fix 4: `routes/auth.js` — Return token in response body
Add `token` and `refreshToken` to JSON response alongside `user` object, maintaining backward compatibility.

### Fix 5: `routes/auth.js` — Generate refresh token on signup
Add refresh token generation to signup route, matching login behavior.

### Fix 6: `routes/auth.js` — Relax `sameSite` for auth cookies
Change `sameSite: 'strict'` to `sameSite: 'lax'` for compatibility with email-based redirect flows, or make it configurable.

**All fixes are backward-compatible**: response shape preserves existing `user` key; routes and paths unchanged; cookie-based auth still primary.