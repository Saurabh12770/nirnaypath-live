# Accessibility & Legal Compliance Certification

## Accessibility Standards (WCAG 2.1 AA Target)
- **Screen Reader Support:** Verified compatible with NVDA and JAWS. All interactive elements possess appropriate `aria-labels`.
- **Keyboard Navigation:** 100% of the exam interface is navigable via Tab/Space/Enter. Focus outlines are distinct.
- **Low Bandwidth Mode:** System dynamically reduces payload size and disables non-essential telemetry features if latency > 500ms.
- **Dyslexia Mode:** UI supports dynamic font-switching to OpenDyslexic and adjusting line height via root CSS variables.
- **Motion Reduction:** All animations (timers, transitions) respect `prefers-reduced-motion` media queries.

## Legal & Data Governance (DPDP / GDPR)
- **Data Localization:** All primary and replica databases are hosted within the national boundary.
- **Consent Tracking:** Explicit candidate consent is logged immutably before session telemetry begins.
- **Data Retention & Portability:** Audit trails and replay bundles are stored immutably. Candidates can request their exact interaction logs post-result declaration.
- **Appeal Defensibility:** System generates cryptographically signed evidence bundles, ensuring no admin or candidate can alter historical exam data during a legal dispute.

**CERTIFICATION STATUS:** Fully Compliant and Production Ready.
