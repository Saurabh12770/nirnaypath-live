# PHASE 19 — DEPENDENCY ANALYSIS REPORT
**System:** NirnayPath CBT Platform  
**Audited By:** Senior Staff SRE + Codebase Forensics Auditor  
**Date:** 2026-05-19  
**Status:** 🔬 STATIC & DYNAMIC ANALYSIS COMPLETED  

---

## 1. Executive Summary

A zero-trust forensic dependency audit was conducted on the NirnayPath codebase using the `/services/DependencyGraphEngine.js` tool. Our primary SRE objective was to expose circular imports, detect duplicate service responsibilities, locate orphan utility services, and identify resource-leak risks from multiple Redis clients or cache layers.

---

## 2. Dependency Graph Findings

### 2.1 Circular Dependencies
**Status:** ✅ **0 Circular Imports Detected**  
The static file analyser recursively parsed all local `require()` calls and verified that the NirnayPath dependency graph forms a clean Directed Acyclic Graph (DAG). There are no circular routing loops (e.g., Service A requiring Service B requiring Service A) that could cause runtime boot deadlocks or memory exhaustion under garbage collection.

### 2.2 Multiple Cache Layers (Violations Identified)
Our analysis confirmed a structural violation where two completely separate caching maps exist in memory:
1. **Canonical Cache:** `services/cacheLayer.js` (an in-process, LRU-evicting, TTL-aware, version-safe static Map).
2. **Local Middleware Cache:** `middleware/cache.js` (maintains its own distinct `localCache` Map instance).

*Risk:* **Medium-High**. The middleware cache keys use a hardcoded `v1_` prefix, which does not automatically clear when `cacheLayer.js` version-bumps or triggers an LRU eviction. This can cause **cache desynchronization** where API clients receive stale question pools or metrics that differ from the authoritative database snapshot.

### 2.3 Multiple Redis Clients (Violations Identified)
We identified 5 distinct files initializing separate `ioredis` connections instead of reusing the canonical singleton. This violates the **Single Source of Truth** pattern and saturates the Railway connection pool under high concurrency.

| Source File | Instantiation Type | SRE Risk Assessment |
|---|---|---|
| `services/redisService.js` | Canonical Singleton | **NONE** — Single connection with robust backoff and error handlers. |
| `middleware/cache.js` | Direct `new Redis()` | **HIGH** — Connects separately, and fails to reuse `redisService` pool. |
| `services/NotificationCenterService.js` | Two separate `new Redis()` | **HIGH** — Bypasses URL configs, lacks retry strategy, falls back to `localhost` in production. |
| `workers/ai-perf-worker.js` | Direct `new Redis()` | **MEDIUM** — Standalone worker thread client. |
| `services/socketService.js` | Two separate clients (Pub/Sub) | **LOW** — Structurally required for Redis Socket.io Adapter (Pub/Sub must be isolated). |

---

## 3. Unused / Orphan Services Catalog

Through an AST and recursive require-cache scan, we identified 13 files under `services/` that have **zero production-wired references**. These were introduced during Phases 15-18 as experimental SaaS, billing, and autonomous pilots:

1. `services/GovernanceIntelligenceEngine.js` (Dormant, used only by chaos suites)
2. `services/SelfHealingInfrastructureEngine.js` (Dormant, used only by chaos suites)
3. `services/IncidentPredictionEngine.js` (Orphaned, no imports found)
4. `services/TelemetryIngestService.js` (Dormant stub, no production wire)
5. `services/NotificationCenterService.js` (Orphaned, contains rogue Redis connections)
6. `services/InstitutionOnboardingService.js` (Orphaned, no route wiring)
7. `services/LocalizationEngine.js` (Orphaned)
8. `services/SearchIndexService.js` (Orphaned)
9. `services/CommunicationOrchestrator.js` (Orphaned)
10. `services/DisasterRollbackService.js` (Orphaned)
11. `services/AuditForensicsService.js` (Orphaned)
12. `services/DigitalTwinEngine.js` (Orphaned)
13. `services/TenantAbuseEngine.js` (Orphaned)

*SRE Action Plan:* These files must remain quarantined (not imported in `app.js` or standard middleware) until they are refactored to comply with the Architecture Freeze invariants (e.g. using `redisService` rather than naked imports).

---

## 4. SRE Recommendations

1. **Unify Redis Connections:** Deprecate the direct Redis instantiations in `middleware/cache.js` and `workers/ai-perf-worker.js` in favor of `require('./redisService').getRedisClient()`.
2. **Deprecate Duplicate Cache:** Refactor `middleware/cache.js` to read/write directly via `cacheCoordinatorService.js`, completely eliminating the secondary `localCache` Map in memory.
3. **Quarantine Orphan Services:** Keep Phase 15-18 advisory files disconnected from active API routers to prevent unauthorized memory load.
