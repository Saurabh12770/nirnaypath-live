# Scalability Master Plan (Lakh+ Scale)

## Overview
This defines the infrastructure trajectory to support 100,000+ concurrent students.

## Distributed Architecture Strategies
1. **Redis Pub/Sub Scaling**: WebSockets will utilize Redis Adapter to scale across multiple PM2/Railway instances.
2. **Sticky Session Architecture**: Ensuring real-time exam state stays attached to a specific instance memory cache when possible to reduce DB hits.
3. **CDN Strategy**: Pre-loading the 17 massive JSON question banks (56MB total) via Cloudflare CDN to ensure zero latency during exam start.
4. **Horizontal DB Scaling Plan**: Partitioning Test Sessions by Exam Date or Region.
5. **Rate Limiter Splitting**: Separating auth limiters from exam-submission limiters.
