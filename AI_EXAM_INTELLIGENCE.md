# AI Exam Intelligence & Performance Engine V2

## Overview
The AIPerformanceEngine transforms basic accuracy metrics into a highly granular, psychometric assessment of the candidate.

## Core Metrics Generated
1. **Confidence Score**: Measures candidate confidence vs. actual correctness.
2. **Accuracy Velocity**: The rate of improvement across a live session.
3. **Stress Indicators**: Detected via erratic timing, massive time spent without answering, and erratic switching between options.
4. **Careless Mistake Index**: High-frequency errors on historically high-mastery topics with very short interaction times.
5. **Conceptual Strength Mapping**: Pinpoints exact sub-topics where conceptual gaps exist, not just top-level subjects.

## Architecture
- `AIPerformanceEngine` class analyzes the `answers` array which now includes micro-timing metrics.
- Utilizes an exponential moving average (EMA) to map fatigue vs. performance drop-off during 3-hour exams.
- Generates `learningProfile` metadata attached to the User.
