# Phase 11C: Shadow Operations Dashboard Architecture

## Components
*   **Active Telemetry Streams**: Live monitoring of incoming heartbeat packets.
*   **Fraud Score Heatmaps**: Real-time aggregated view of suspicious behavior flags.
*   **Event Loop Lag**: Constant monitoring of PM2 main thread responsiveness.
*   **Redis Pressure Guard**: Live visualization of Redis memory consumption.
*   **Ranking Throughput**: TPS (Transactions Per Second) of the leaderboard.

## Security
*   Dashboard is protected via internal JWT admin verification.
*   Safe for live polling (no expensive DB queries).

## Status
Fully operational and deployed internally.
