# EXAM CREATION GOVERNANCE PIPELINE

## 1. Exam Lifecycle Stages
The journey of an exam from creation to execution follows a strict, one-way state machine:
`Draft -> Review -> Approved -> Scheduled -> Locked -> Live -> Archived`

## 2. Governance Rules
- **Dual Approval System:** A single user cannot draft and approve an exam. A designated reviewer role must transition the exam to `Approved`.
- **Question Freeze Windows:** Once an exam enters the `Locked` state (typically 48 hours before execution), no structural or content changes are permitted.
- **Rollback-Safe Versioning:** Any necessary edits prior to the freeze result in a new exam version; older versions are retained for audit trails.
- **Last-Minute Edit Protections:** Cryptographic hashes (`publishHash`) of the exam configuration and question pool are generated upon Locking. The execution engine verifies this hash before launching the exam.

## 3. Cryptographic Hash Integrity
- When locked, `ExamLifecycleService` computes a SHA-256 hash of the complete exam payload.
- Any direct DB tampering will invalidate the hash, causing the engine to refuse the `Live` transition and trigger an active incident response.
