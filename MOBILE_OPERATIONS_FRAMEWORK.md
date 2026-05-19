# NATIONAL MOBILE OPERATIONS SUITE FRAMEWORK

## Objective
Provide NirnayPath operations executives and SREs with a responsive, mobile-first command center to manage national-scale exams on the go.

## Core Capabilities
1. **War-Room Alerts:** Push notifications for P1/P0 incidents (e.g., Redis cluster failover).
2. **Infrastructure Health:** Live gauges for PM2 metrics, DB connections, and API latencies.
3. **Live Candidate Traffic:** Concurrency metrics grouped by state/region.
4. **Incident Escalation:** One-tap escalation to Level 3 engineering.

## Security Standard
- Accessible ONLY via internal VPN.
- Requires MFA on every session.
- Read-only by default; destructive actions (like scaling down) require a secondary PIN.
