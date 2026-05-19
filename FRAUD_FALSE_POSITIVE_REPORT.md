# Phase 11C: Fraud Engine False-Positive Lab

## Purpose
Ensure no innocent candidates are wrongly flagged by the Shadow Fraud Engine due to nervous behavior, slow network, or shared accessibility tools.

## Simulation Scenarios Tested
1.  **Nervous User**: Rapid clicks and mouse shaking generated low scores (< 30). *PASS*
2.  **Slow Network**: High latency generated 0 fraud flags. *PASS*
3.  **Accessibility User**: Slow typing + screen reader generated 0 fraud flags. *PASS*
4.  **Shared IP**: A shared caching center IP with 50 users did not trigger auto-ban thresholds without secondary behavioral flags. *PASS*

## Conclusion
The false-positive rate is negligible. Threshold recommendations remain safe for eventual live implementation. No auto-bans are enabled.
