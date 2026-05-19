# Maintainability Governance Framework

## Overview
The Maintainability Governance Service ensures that the massive NirnayPath codebase does not degrade into technical debt over time. It continuously audits the architecture to ensure long-term sustainability.

## Capabilities
- **Detect Architectural Drift:** Flags code that bypasses established patterns (e.g., direct DB access instead of via repository).
- **Identify Deprecated Services:** Highlights APIs or modules that have been superseded but remain in the codebase.
- **Track Technical Debt Growth:** Measures code complexity, test coverage drop-offs, and "TODO" comments.
- **Monitor Feature-Flag Sprawl:** Identifies feature flags that have been fully rolled out but not removed from the codebase.
- **Detect Governance Duplication:** Finds redundant policy enforcement checks across different services.
- **Recommend Cleanup Windows:** Advises SRE and Dev teams on low-traffic periods suitable for refactoring and cleanup deployments.

## Principles
- **Continuous Audit:** Runs as a low-priority background process.
- **Actionable Reports:** Generates targeted PRs or Jira tickets for cleanup tasks.
