# Phase 11D: Legal & Audit Forensics Framework

## Objective
Ensure NirnayPath can survive any formal, legal, or governmental audit.

## Mechanism
*   **Immutable Hashes**: The `AuditForensicsService.js` records every significant event (Ranking derivation, Normalization math, Fraud evidence, Governance overrides) using SHA-256 hashes bound to a secret salt.
*   **WORM Storage**: Data is designed for Write-Once-Read-Many archival.
*   **Reconstruction Timelines**: Complete candidate sessions can be reconstructed and mathematically verified post-exam.

## Conclusion
NirnayPath achieves a TCS iON / NTA level of legal defensibility.
