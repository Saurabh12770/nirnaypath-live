# Phase 11D: Exam Governance Framework

## Overview
The Exam Governance Service transitions NirnayPath from a standard CBT engine to a strict institutional exam conductor.

## Enforced Policies
*   **Late-Entry Policy**: Automated enforcement of grace periods (e.g., 15 minutes) based on strict server-time differential.
*   **Shift Locking**: Immutable locking of exam windows once the primary shift has concluded.
*   **Immutable Governance Logs**: Every administrative override or system enforcement is logged with a SHA-256 cryptographic hash.

## Compliance
Provides a complete, append-only chronological log of all governance events, fulfilling all standard requirements for national exam supervision.
