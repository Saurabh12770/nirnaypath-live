# COMPLIANCE & PRIVACY GOVERNANCE

## 1. Regulatory Alignment
NirnayPath is designed to be fully compliant with national and international data privacy regulations (e.g., GDPR, local DPDP acts). 

## 2. PII Minimization
- The system only ingests absolutely necessary Personal Identifiable Information (PII).
- `ComplianceGovernanceService` ensures names, national IDs, and contact info are hashed or encrypted at rest. Reviewers and Proctors only see masked identifiers (e.g., "Candidate #8492").

## 3. Data Rights Management
- **Right to Export:** Candidates can securely request a cryptographic export of all their telemetry, scores, and exam interactions.
- **Consent Management:** Strict gating ensures exams cannot start without verified digital consent to AI monitoring and webcam telemetry.

## 4. Institutional Policies
- **Data Retention Limits:** Each institution defines a TTL (Time-To-Live) for candidate data (e.g., 365 days). The service automatically purges expired records immutably.
- **Right to Delete Workflows:** For non-governmental instances, automated workflows handle candidate deletion requests while preserving anonymous statistical data required for IRT normalization.
