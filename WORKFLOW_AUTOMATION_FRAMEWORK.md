# WORKFLOW AUTOMATION FRAMEWORK

## Objective
Automate redundant administrative tasks across the NirnayPath ecosystem to ensure scalability without linearly increasing operational headcount.

## Core Capabilities
1. **Onboarding Automations:** Auto-approves creator accounts that pass 100% of KYC and initial AI-vetting checks.
2. **Support Escalations:** Auto-routes tickets mentioning "payment failed" directly to Level 2 Billing Support.
3. **Exam Lifecycle Automations:** Automatically archives test data 30 days post-exam and generates final PDF reports for institutions.
4. **Payout Workflows:** Triggers batch payouts on the 1st of every month for creators with >$100 balances.

## Safety & Compliance
- **Queue-Safe:** Uses BullMQ (Redis) to ensure no tasks are dropped.
- **Rollback-Capable:** All automated DB mutations run inside Mongoose/MongoDB transactions.
- **Audit-Traceable:** Every action logs an entry in the `AuditLog` collection marked as `SYSTEM_AUTOMATION`.
