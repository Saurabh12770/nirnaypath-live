# ENTERPRISE RBAC + ABAC SECURITY & GOVERNANCE

## 1. Zero-Trust Access Model
No action is blindly trusted. Access requires both **Role-Based** permissions (Who are you?) and **Attribute-Based** constraints (Where are you? What time is it? What institution are you acting upon?).

## 2. Roles
- **Super Admin:** Global oversight, emergency overrides (requires dual approval).
- **National Admin:** Cross-state operational control.
- **State Admin:** Geographically bounded operational control.
- **Institution Admin:** Tenant-scoped control over their own exams and candidates.
- **Proctor:** Shift-scoped, center-scoped real-time monitoring.
- **Reviewer:** Scope-limited to post-exam fraud or appeal review tasks.
- **Candidate:** Locked-down exam-taking privileges only.

## 3. Attribute-Based Controls (ABAC)
- **Geography:** Admins can only view centers in their authorized regions.
- **Institution:** Hard tenant boundaries.
- **Shift & Time:** Proctors lose access exactly when their shift time window closes.

## 4. Immutable Audit & Temporary Access
- All authorization decisions are logged to an immutable append-only ledger (`AuditLogger`).
- High-risk actions support **Temporary Access Grants** that auto-expire, minimizing persistent privilege vectors.
