# DEVELOPER ECOSYSTEM & PUBLIC APIs ARCHITECTURE

## Objective
Provide a robust, self-serve developer portal for institutional IT teams integrating with NirnayPath. Focus on usability, rate-limiting, and webhook management.

## Key Features
1. **API Analytics Dashboard:** Live view of rate limits, request volume, and error rates.
2. **Sandbox Environments:** Safe `test_` prefixed keys for CI/CD integration without mutating production DB.
3. **Webhook Testing:** Integrated webhook echo and payload inspection.
4. **SDK Onboarding:** Pre-generated snippets for Node.js, Python, and Java.

## Rate Limiting Standards
- General Endpoints: 100 req/min
- Payout/Financial Endpoints: 20 req/min
- Webhook Delivery: Exponential backoff with max 5 retries.
