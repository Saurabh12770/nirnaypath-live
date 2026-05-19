# NOTIFICATION CENTER ARCHITECTURE

## Overview
A real-time, Redis-backed pub/sub notification center for NirnayPath, designed to handle institutional alerts, operational warnings, candidate exam reminders, and ecosystem updates.

## Architecture
- **Transport:** Server-Sent Events (SSE) or WebSockets for real-time delivery.
- **Backing Store:** Redis Pub/Sub for cross-node broadcasting.
- **Persistence:** MongoDB for offline message retention.
- **Throttling:** Max 5 notifications per minute per user to prevent UX flooding.

## Event Types
1. `EXAM_REMINDER`: Sent 24h and 1h before scheduled CBT.
2. `SYSTEM_ALERT`: Platform-wide operational alerts.
3. `INSTITUTION_UPDATE`: Payouts, onboarding status, compliance warnings.
4. `SUPPORT_TICKET`: Updates on escalated issues.

## Mobile Optimization
Payloads are kept under 2KB. Background sync integrated via PWA Service Workers.
