# Production Deployment Checklist — NirnayPath

This checklist details the architectural steps to safely release and scale the NirnayPath EdTech platform to support 100k+ concurrent active users.

---

## 1. Environment & Secrets Validation
- [ ] Run environment validation check: `node scripts/validate_env.js`
- [ ] Verify `JWT_SECRET` is set to a cryptographically secure 256-bit string.
- [ ] Ensure `NODE_ENV` is set to `production` (enables HSTS, security headers, optimized Express routing).
- [ ] Set `PORT` (default `3000`).

---

## 2. Database Hardening & Scaling
- [ ] Ensure MongoDB has Authentication enabled (`security.authorization: enabled`).
- [ ] Verify MongoDB Indexes exist for hot query fields (specifically compound indexes in `User`, `Payment`, and `UserXP` schemas).
- [ ] Configure Redis L1/L2 Cache parameters (set maxmemory policy to `volatile-lru` or `allkeys-lru`).
- [ ] Schedule database backup crons via [backup.sh](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/scripts/backup.sh) every 24 hours.

---

## 3. Payment Gateway Configuration
- [ ] Configure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with production credentials.
- [ ] Register Razorpay Webhooks targeting `https://<domain>/api/payment/webhook`.
- [ ] Secure webhook validation by configuring `RAZORPAY_WEBHOOK_SECRET`.

---

## 4. SEO & Cache Policies
- [ ] Add sitemap reference in Google Search Console: `https://<domain>/sitemap.xml`.
- [ ] Verify static file caching: assets have 1-year immutable header cache rules, HTML templates have 5-minute maximum cache TTL.
- [ ] Register Service Worker scope in production domain to enforce runtime caching for drills and recommended questions.

---

## 5. System Monitoring & SRE
- [ ] Ensure Sentry DSN configuration is complete for background crash reports.
- [ ] Set up Prometheus scrape configs for node resources.
- [ ] Check server cluster configuration: App boots using Node `cluster` module matching available cores on the host VPS.
