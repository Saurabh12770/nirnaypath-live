# Quality Enforcement Framework

## Overview
The Quality Enforcement Engine safeguards the integrity of the NirnayPath ecosystem by proactively identifying sub-standard content, fraudulent actors, and abusive usage patterns.

## Capabilities
- **Detect Low-Quality Marketplace Content:** Flags exams with poor formatting, excessive duplicate questions, or low candidate ratings.
- **Detect Spam Educators:** Identifies creators who rapidly publish low-effort content or engage in review manipulation.
- **Identify Abusive Institutions:** Flags tenants attempting to bypass candidate limits or exploiting support channels.
- **Flag Suspicious Onboarding Behavior:** Detects bot-like registration patterns or forged KYC documents.
- **Recommend Moderation Review:** Queues flagged entities for human inspection.

## Constraints
- **Human Review Only:** The engine does not autonomously ban or delete; it only flags for moderation.
- **Explainable Signals:** Every flag includes the exact reason (e.g., "75% question overlap with existing exam").
- **Audit-Safe:** All moderation actions (flags, approvals, rejections) are immutably logged.
