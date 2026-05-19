# MULTI-TENANT INSTITUTIONAL ARCHITECTURE

## 1. Core Philosophy
NirnayPath's architecture now guarantees mathematical and cryptographic isolation between institutions. A university using the system will never leak data to a government recruitment agency, nor will load spikes from one tenant affect the SLA of another.

## 2. Institutional Boundaries
- **Institution-Scoped Data:** Database queries automatically append `institution_id` middleware filters.
- **Isolated Caching:** Redis keys are namespaced `inst:<CODE>:<ENTITY>`.
- **Telemetry Isolation:** Logs and real-time monitoring are tagged with the institution code for isolated Command Center views.

## 3. Deployment Scaling
- Configurable Data Isolation Levels (Strict vs Shared DB clusters).
- Auto-scaling rules scoped per institution limits (e.g., maximum concurrent candidates).
- Independent Audit Chains and cryptographic seals per tenant.

## 4. Governance
- Super Admins oversee the ecosystem but cannot decrypt institution-level candidate data without dual-approval logs.
- Cross-tenant data leakage is fundamentally prevented at the ORM/Service layer via `InstitutionIsolationService`.
