# ECOSYSTEM OBSERVABILITY INTELLIGENCE

## Objective
Provide a unified, asynchronous telemetry pipeline that monitors the health of the entire NirnayPath ecosystem—ranging from candidate UX latency to creator marketplace liquidity—without blocking core operational threads.

## Tracked Metrics
1. **Adoption & Usage:** Feature toggle usage, PWA install rates, multi-language toggles.
2. **Onboarding Friction:** Drop-off points in institutional and creator KYC flows.
3. **UX Latency:** Frontend rendering times, time-to-first-byte (TTFB) for exam question loads.
4. **Marketplace Quality:** Ratio of highly-rated exams vs reported exams.
5. **Infrastructure Drift:** Deviations from standard PM2 memory baselines.

## Technical Rules
- **Async Aggregation:** Telemetry must be batched and sent via background workers (e.g., Redis Streams) to avoid slowing down API responses.
- **Privacy-Safe:** No PII is logged. Only aggregated data or anonymized session IDs are permitted.
