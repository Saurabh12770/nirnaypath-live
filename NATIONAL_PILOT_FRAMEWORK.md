# National Pilot Framework

## Objective
The National Pilot Framework defines the controlled rollout of NirnayPath across various tiers to validate real-world operational safety, governance adherence, and system stability before a nationwide public launch.

## Rollout Tiers

### Tier 1: Internal/Private Mock Pilot
- **Scale:** 100 - 500 candidates.
- **Target Audience:** Internal staff, beta testers.
- **Focus:** Validating core CBT engine, timer synchronization, and basic fraud telemetry in a fully controlled environment.

### Tier 2: Coaching Institutes
- **Scale:** 1,000 - 5,000 candidates.
- **Target Audience:** Partner coaching institutes.
- **Focus:** Assessing multi-tenant isolation, concurrent load handling, institutional admin workflows, and real-world network fluctuations (e.g., candidates connecting from various ISPs).

### Tier 3: University Onboarding
- **Scale:** 10,000+ candidates.
- **Target Audience:** Real universities conducting entrance or semester exams.
- **Focus:** High-concurrency database stability, Redis stream backpressure handling, national war room operational stress, and legal audit trail generation.

## Tracked Metrics
During all pilot tiers, the `PilotGovernanceService` will actively monitor:
1. Operational incident frequency (P0-P3).
2. Support ticketing load vs. active candidate ratio.
3. False-positive rates in the AI Fraud Engine.
4. Edge-case accessibility complaints.
5. Operator/Admin mistakes requiring rollback or override.
6. System recovery behavior under induced or organic failure.

## Exit Criteria
A tier is considered successfully piloted only when:
- 0 data loss incidents occur.
- Support load remains < 5% of concurrent users.
- P0 incidents are fully recoverable within 2 minutes.
- All AI fraud flags are successfully reviewed and ratified by the Institutional Review Board without process breaks.
