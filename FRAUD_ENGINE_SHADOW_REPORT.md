# Fraud Engine Shadow Report
## 1. Overview
The Phase 11 AI Fraud Detection Engine has been deployed in **Shadow Mode**. This ensures we collect probability metrics and tune our algorithms on live production traffic without risking false-positive bans for legitimate candidates.

## 2. Shadow Implementation
File: `services/FraudDetectionEngine.js`

- **Execution**: Runs asynchronously, scanning batches of telemetry data.
- **Vectors Analyzed**:
  - Impossible Timings (answering complex questions instantly).
  - Rapid click anomalies.
- **Action**: Increments the `fraudProbabilityScore` in the `TestSession` document.
- **Critical Safety**: The enforcement logic (auto-locking the session if score > 80) is deliberately bypassed. The system is currently strictly observable.

## 3. Verification Criteria for Activation
Before exiting Shadow Mode, the SRE and Data Science teams must verify:
1. Less than 0.1% false-positive rate on a sample size of 10,000 sessions.
2. Redis Pub/Sub correlation for synchronized cheating rings (Future vector) executes in under 50ms.
3. No measurable impact on MongoDB write queues.
