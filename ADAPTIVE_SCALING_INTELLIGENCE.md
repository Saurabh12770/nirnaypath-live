# Adaptive Scaling Intelligence

## Overview
The Adaptive Scaling Intelligence service provides predictive analytics for infrastructure capacity planning. It forecasts load spikes based on scheduled events and historical usage patterns, offering actionable scaling recommendations.

## Capabilities
- **Predict Exam Surges:** Analyzes the exam calendar to forecast high-concurrency periods.
- **Estimate Redis Exhaustion Windows:** Predicts when Redis memory or connections might reach critical limits.
- **Forecast Mongo Pressure:** Anticipates heavy write/read cycles (e.g., mass result processing).
- **Predict Onboarding Spikes:** Detects trends indicating an influx of new registrations.
- **Recommend PM2 Scaling Windows:** Advises on optimal times to scale worker processes up or down.

## Constraints
- **Predictive Only:** The engine does not automatically scale infrastructure; it only provides advisory data.
- **Advisory-First:** Recommendations must be approved by SREs.
- **Explainable Outputs:** All scaling forecasts include clear rationales (e.g., "Scaling recommended due to 50k scheduled concurrent users at 10 AM").
