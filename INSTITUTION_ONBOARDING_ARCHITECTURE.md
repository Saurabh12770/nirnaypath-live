# Phase 16: Institution Onboarding Architecture

## Overview
The Institution Onboarding subsystem transforms NirnayPath from a single-tenant deployment into a scalable Multi-Tenant SaaS platform. It automates the provisioning, verification, and bootstrapping of new educational institutions and government bodies.

## Core Capabilities
1. **Guided Onboarding**: Step-by-step wizard for institution registration.
2. **Domain Verification**: Automated SMTP and DNS validation for official domain ownership.
3. **Subdomain Provisioning**: Dynamic routing and DNS management for tenant-specific URLs (e.g., `agency.nirnaypath.com`).
4. **Admin Bootstrapping**: Automated creation of the root tenant administrator and default RBAC policies.
5. **Branding Setup**: Self-serve portal for uploading logos, configuring color schemes, and setting custom email templates.

## Architecture
- **Service**: `InstitutionOnboardingService.js` orchestrates the workflow.
- **State**: Tracks progress through `INITIATED` -> `VERIFIED` -> `PROVISIONED` -> `BOOTSTRAPPED`.
- **Security**: Requires manual approval from NirnayPath super-admins for high-tier institutional accounts to prevent spoofing.

## Data Model (TenantOnboarding)
- `workflowId`: Unique tracking ID
- `institutionName`: String
- `domain`: String (Verified status)
- `subdomain`: String (Provisioned status)
- `progress`: Percentage/Step tracking
- `adminContacts`: Array of verified emails
