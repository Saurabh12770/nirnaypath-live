# NATIONAL ANALYTICS COMMAND CENTER

## 1. Objective
A centralized, low-latency dashboard for National Admins to monitor the entire ecosystem health in real-time. It completely removes the need for direct database access for operational oversight.

## 2. Telemetry Ingestion
- Ingests high-throughput streams from PM2 clusters, Redis Queues, and the Fraud Engine.
- Uses PM2-safe telemetry aggregators to ensure monitoring overhead does not impact the test-taking experience.

## 3. Core Displays
- **Candidate Distribution Maps:** Geospatial rendering of live test-takers.
- **Center Risk Heatmaps:** Visualizes connection instability or spike in flagged fraud incidents per physical location.
- **Queue Pressure & System Health:** Live metrics on DB latency, Event Loop lag, and Worker throughput.
- **Normalization Variance:** Real-time calculation of score variance across active shifts.

## 4. Security
- Accessible only via strictly enforced `national_admin` and `super_admin` roles over an internal VPN route.
- Read-only; cannot issue commands or alter state directly without invoking the `IncidentResponseService`.
