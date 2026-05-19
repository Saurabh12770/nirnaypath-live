# National Scale SRE (Site Reliability Engineering)

## Overview
Phase 11 SRE targets the resilience required to host 1 Lakh+ concurrent simulated candidates across unstable networks.

## Core Implementations
1. **PM2 Cluster Drift Protection**: Ensuring worker nodes don't fall out of sync with Redis.
2. **Queue Isolation**: Separating critical write queues (Test Submission) from analytical queues (Performance Scoring).
3. **Websocket Storm Handling**: Circuit breakers to handle 10k/sec reconnection storms after an outage without crashing the Node.js event loop.
4. **Heartbeat Floods**: Debouncing heartbeat metrics in Redis before flushing to MongoDB to avoid write exhaustion.
