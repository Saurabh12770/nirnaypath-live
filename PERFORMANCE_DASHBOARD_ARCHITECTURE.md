# Phase 11D: Performance Dashboard Architecture

## Philosophy
The Candidate Performance Intelligence Dashboard is designed to be highly motivational, psychologically safe, and strictly explainable. No "black-box" AI terminology is exposed to the candidate.

## Components
*   **Confidence Score**: Displayed as a percentage with a clear explanation of the steady behavioral patterns that led to it.
*   **Stress Indicator**: Replaces the term "Panic Probability" for the user. Highlighted as a measure of time-management rhythm.
*   **Topic Mastery**: Identifies strengths and provides actionable revision recommendations without demotivating language.

## Architecture
The dashboard is decoupled from the main exam flow, fetching pre-computed AI metrics asynchronously from the backend Redis cache. 

## Conclusion
The dashboard meets all governance standards for psychological safety and transparency.
