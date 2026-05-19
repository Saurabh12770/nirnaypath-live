# Phase 15A: Commercial Foundation Layer Architecture

## 1. Executive Summary
The Commercial Foundation Layer transforms NirnayPath from a cost-center operational platform into a Revenue-Generating Institutional SaaS Ecosystem. It supports B2C (Individual candidates) and B2B (Universities, Coaching Institutions, Governments) through a unified `BillingEngine`.

## 2. Core Components

### 2.1 Schema Upgrades
- `models/SubscriptionPlan.js`: Defines dynamic capabilities (Free, Pro, Elite, Institutional Tiers) including Quotas (Storage, Students) and Unlocks (AI Analytics, Adaptive Sandbox).
- `models/BillingLedger.js`: A forensic, immutable log of all transactions. Supports cryptographic integrity hashing (`integrityHash`) for legal defensibility and dispute resolution.

### 2.2 Service Layer
- `services/BillingEngine.js`: Orchestrates payment intent creation, webhook processing from Razorpay, state transitions (Active, Grace Period, Expired), and rollback protection.
- `services/InvoiceService.js`: Automatically generates GST-compliant Tax Invoices for institutions. Asserts B2B parameters (GSTIN mapping) and anchors the ledger hash in the footer for fraud resistance.

## 3. Operational Guarantees (SRE & Scale)
- **Feature Flags**: Wrapped under `ENABLE_COMMERCIAL_BILLING_V2`. Entire billing automation can be hot-disabled during critical national exams without restarting PM2 workers.
- **Grace Periods**: Configured `GRACE_PERIOD_DAYS = 7` to avoid locking out students/institutions on transient payment failures.
- **Idempotency**: Webhook endpoints enforce `razorpayOrderId` and `razorpayPaymentId` uniqueness to prevent double-upgrades.
- **Concurrency**: Fully safe within PM2 clustering and Redis locking mechanisms (already part of architecture) ensuring overlapping webhooks don't duplicate state transitions.

## 4. Legal Defensibility
Every successful payment updates the `BillingLedger` generating a `sha256` HMAC over the transaction parameters (`transactionId`, `amount`, `status`, `entityId`, `timestamp`). This allows the national auditing body to programmatically verify that NirnayPath subscription ledgers have not been tampered with via unauthorized DBA access.
