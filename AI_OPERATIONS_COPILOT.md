# AI OPERATIONS COPILOT ARCHITECTURE

## Purpose
The AI Operations Copilot is an advisory engine designed to monitor NirnayPath's national-scale infrastructure. It detects anomalies, explains Redis pressure, suggests rollout pauses, and identifies abnormal candidate patterns, maintaining a strictly non-destructive, explainable advisory mode.

## Key Capabilities
1. **Incident Summarization:** Translates PM2/Redis alerts into human-readable Slack/Dashboard summaries.
2. **Bottleneck Prediction:** Monitors node event loops and Redis memory, predicting exhaustion events 30 minutes in advance.
3. **Rollout Advice:** Recommends pausing institutional onboarding if error rates spike.
4. **Candidate Pattern Anomalies:** Detects suspicious cross-region login bursts.

## Integration Points
- PM2 Metrics API
- Redis INFO telemetry
- Express.js error tracking middleware
- Ecosystem Observability Engine

## Explainability Mandate
All AI recommendations must include the source metrics (e.g., "Recommend scaling Redis because Memory Fragmentation Ratio is > 1.5").
