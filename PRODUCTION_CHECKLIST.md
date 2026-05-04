# Production Readiness Checklist ✅

Before going live, ensure every item on this list is completed and verified.

### 🔐 Security
- [ ] `NODE_ENV` is set to `production`.
- [ ] `JWT_SECRET` is changed from default to a strong random string.
- [ ] Helmet headers are active and CSP allows Razorpay/Google Fonts.
- [ ] Rate limiting is enabled on all `/api` routes.
- [ ] All sensitive keys (.env) are NOT committed to version control.
- [ ] Admin panel is only accessible to users with `role: 'admin'`.

### 🗄️ Database
- [ ] `scripts/migrate.js` has been executed on the production DB.
- [ ] MongoDB Atlas automated backups are enabled.
- [ ] Connection string uses `+srv` and secure credentials.

### 📧 Notifications & Engagement
- [ ] SMTP email settings are verified (test a mock result email).
- [ ] VAPID keys for push notifications match between frontend and backend.
- [ ] Weekly Email Digest cron job is running.

### 💳 Payments
- [ ] Razorpay is switched to **Live Mode**.
- [ ] Webhook for payment verification is configured (if applicable).
- [ ] Subscription plan IDs match between frontend and `config/plans.js`.

### 🌐 Frontend & UX
- [ ] Static assets are versioned (`?v=2.0.0`) to avoid cache issues.
- [ ] PWA manifest is valid and service worker registers correctly.
- [ ] Offline mode loads cached dashboard and questions.
- [ ] "Install App" button works on supported browsers.

### 🤖 AI Bot
- [ ] `AI_API_KEY` is valid and quota is sufficient.
- [ ] Bot persona (Nirnay Bot) identifies correctly.
- [ ] Rate limiting for free users (100/day) is functional.

### 📈 Monitoring
- [ ] `/health` endpoint is reachable.
- [ ] Sentry DSN is configured (optional).
- [ ] Server logs are accessible for debugging.
