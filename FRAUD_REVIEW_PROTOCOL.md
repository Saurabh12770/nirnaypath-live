# Phase 11D: Fraud Review Protocol

## Controlled Activation
The AI Fraud Engine has been activated strictly in "review recommendation mode." 

## Key Policies
*   **No Auto-Bans**: Automated bans based solely on AI suspicion are strictly prohibited.
*   **Explainable Vectors**: When a candidate crosses the human-review threshold (Score >= 70), specific triggers (e.g., "Mouse left window 5+ times") are explicitly listed.
*   **Forensic Bundles**: Every flagged session generates a cryptographic forensic bundle containing the exact timeline of suspicious events for the human reviewer.
*   **Appeals**: The system supports candidate appeal reconstruction based on the retained immutable telemetry stream.

## Conclusion
The system successfully flags potential fraud without risking the unfair penalization of innocent candidates.
