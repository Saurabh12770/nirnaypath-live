# AI Fraud Detection Engine
## 1. Overview
The Phase 11 AI Fraud Detection Engine moves beyond simple rule-based triggers (e.g., tab switches) to a continuous, probabilistic fraud intelligence system capable of identifying coordinated cheating rings and AI-assisted impersonation.

## 2. Fraud Probability Score (0-100)
A real-time metric aggregated from multiple detection vectors.

### Detection Vectors
1. **Impossible Timings**: Answering complex mathematical questions in < 3 seconds (flags automated bots or screen-reading tools).
2. **Synchronized Cheating Rings**: Correlating submission timestamps across multiple sessions. If Candidates A, B, and C consistently submit identical answers within 500ms of each other, ring probability spikes.
3. **Same-Answer-Path Analysis**: Analyzing the sequence of options selected. Two candidates who both change their answer from B -> C -> A at the exact same intervals are highly suspicious.
4. **Subnet & Geolocation Correlation**: Cross-referencing IP subnets and physical center locations with high-scoring clusters.
5. **Coordinated Focus Losses**: Detecting if multiple candidates in the same center trigger `window_blur` events simultaneously (indicates a proctor interruption or coordinated screen sharing).
6. **AI-Generated Answer Patterns**: Identifying unhumanly perfect pacing or lack of variance in `timeSpentMs`.

## 3. Streaming Analysis Architecture
- **Ingestion**: Fraud flags are injected into the standard Heartbeat payload.
- **Pub/Sub**: The backend publishes these events to a Redis Pub/Sub channel (`exam:fraud:events`).
- **Async Processing**: A dedicated `fraud-intelligence-worker.js` listens to the channel, updates the `FraudProbabilityScore` in Redis, and runs graph-based correlation analysis.

## 4. Escalation Policy & Protections
- **0-30**: Normal behavior. No action.
- **31-70**: Suspicious. Triggers enhanced telemetry collection (e.g., forcing a webcam snapshot if integrated, or increasing heartbeat frequency).
- **71-90**: High Risk. Flags the session for manual forensic review by an admin post-exam.
- **91-100**: Critical/Confirmed Fraud. The session is automatically frozen with a non-descriptive error message ("Connection unstable, please contact proctor") to prevent alerting the cheater.

## 5. False-Positive Protections
- Network latency spikes are decoupled from "impossible timings".
- Base scores are normalized against the center's average baseline.
