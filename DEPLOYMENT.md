# NirnayPath Deployment Guide 🚀

This guide provides step-by-step instructions for deploying the NirnayPath platform to a production environment (Railway, Render, or VPS).

## 1. Prerequisites
- A GitHub repository with your project code.
- A MongoDB Atlas account (for managed database) or Railway MongoDB plugin.
- A Razorpay account (Live Mode) for payments.
- A Gemini API Key from Google AI Studio.

## 2. Deployment Steps (Railway - Recommended)

### Step A: Push to GitHub
1. Initialize a git repo: `git init`
2. Add all files: `git add .` (Ensure `.env` is in `.gitignore`)
3. Commit: `git commit -m "chore: prepare for production"`
4. Push to your GitHub repository.

### Step B: Create Railway Project
1. Log in to [Railway.app](https://railway.app).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select the `NirnayPath` repository.

### Step C: Configure Environment Variables
In the Railway Dashboard, go to **Variables** and add all values from `.env.example`:
- `PORT`: 3000
- `NODE_ENV`: production
- `JWT_SECRET`: (generate a long random string)
- `MONGO_URI`: (copy from MongoDB Atlas or use Railway's MongoDB variable)
- `RAZORPAY_KEY_ID`: (your live key)
- `RAZORPAY_KEY_SECRET`: (your live secret)
- `VAPID_PUBLIC_KEY`: (run `npx web-push generate-vapid-keys` if needed)
- `VAPID_PRIVATE_KEY`: (same as above)
- `AI_API_KEY`: (your Gemini API key)
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`: (your SMTP settings)

### Step D: Database Indexing
After the first deployment succeeds, run the migration script to apply indexes:
1. Open the Railway terminal/console.
2. Run: `node scripts/migrate.js`

## 3. Custom Domain & SSL
1. In Railway, go to **Settings** > **Domains**.
2. Click **Custom Domain** and enter `nirnaypath.com` (or your domain).
3. Update your DNS provider with the provided CNAME record.
4. Railway will automatically provision an SSL certificate via Let's Encrypt.

## 4. Post-Deployment Verification
- Visit `https://yourdomain.com/health` to verify server status.
- Test the Login/Signup flow.
- Ensure the PWA "Install" prompt appears.
- Verify the AI Bot answers questions.
- Check the Admin Panel at `/admin`.

---

## 🛠️ Maintenance Commands
- **Check Logs:** `railway logs`
- **Manual Migration:** `node scripts/migrate.js`
- **Re-deploy:** `git push origin main`
