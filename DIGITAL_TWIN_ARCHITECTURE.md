# Digital Twin Architecture

## Overview
The National Digital Twin Observability framework creates a simulated, real-time replica of the NirnayPath ecosystem. It allows SREs and Operations teams to visualize current state, forecast near-future behavior, and safely simulate chaotic events without affecting production.

## Capabilities
- **Simulate Ecosystem State:** Aggregates live telemetry into a holistic, queryable snapshot.
- **Visualize Regional Infrastructure Health:** Maps latency, error rates, and resource usage to geographic zones (North, South, East, West).
- **Visualize Candidate Traffic Density:** Heatmaps active user sessions and predicts local traffic surges.
- **Visualize Operational Bottlenecks:** Highlights slow APIs, lagging background workers, or high-latency DB queries.
- **Simulate Incident Propagation:** Allows SREs to ask "What if Redis goes down now?" and models the cascading impact across the ecosystem.

## Internal Dashboard
Located at `internal/digital-twin-dashboard.html`. This UI is for SREs and Governance teams to interact with the Digital Twin Engine.
