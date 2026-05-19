# Fraud Governance Framework

## Core Philosophy
AI detects anomalies, but humans make the final decisions. The Fraud Review Board acts as the judicial layer of NirnayPath, ensuring no candidate is disqualified solely based on an algorithm without auditable human review.

## Review Process
1. **Case Generation:** If AI Risk Score > Threshold, a case is automatically generated, attaching an immutable `evidenceBundleUrl` (containing screen replays, click-stream, and heartbeat logs).
2. **Independent Voting:** Two Level-1 Admins review the evidence independently and cast a blind vote (`CLEAR`, `DISQUALIFY`, or `ESCALATE`).
3. **Consensus Resolution:** 
   - 2 `CLEAR` votes = Candidate Cleared.
   - 2 `DISQUALIFY` votes = Candidate Disqualified.
   - Mixed votes or 1 `ESCALATE` vote = Case escalated to Level-2 Lead Admin.
4. **Appeal Mechanism:** Disqualified candidates have a 7-day window to file an appeal via the Support portal, triggering a Level-3 forensic audit.

## Legal Defensibility
All votes, notes, and final decisions are cryptographically tied to the original `evidenceBundleUrl`. This ensures the process holds up to scrutiny during RTI (Right to Information) requests or legal challenges.
