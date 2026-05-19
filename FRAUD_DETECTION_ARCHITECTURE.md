# Fraud Detection Engine Architecture

## Overview
Moving beyond rule-based triggers, the `FraudDetectionEngine` uses behavioral intelligence to generate a continuous `fraudProbabilityScore` (0-100).

## Detection Vectors
1. **Synchronized Cheating Rings**:
   - Detects multiple users in the same IP cluster or geographic region submitting answers to identical question subsets at the exact same time.
2. **Timing Anomalies**:
   - Flags "impossible completion speeds" (e.g., solving a complex reasoning question in 1.5 seconds).
3. **Identical Answer Paths**:
   - Detects when two users make the exact same pattern of correct AND incorrect choices, especially when selecting the same low-probability distractors.
4. **Coordinated Focus Loss**:
   - Detects when multiple users lose browser focus simultaneously (indicating screen sharing or external communication).

## Action Mechanism
- Auto-locks session if `fraudProbabilityScore` exceeds 85.
- Flags for manual proctor review if score is 60-85.
