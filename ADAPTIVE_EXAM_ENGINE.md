# Adaptive Exam Engine Architecture

## Overview
The Adaptive Exam Engine enables dynamic, real-time adjustments to exam difficulty based on live item response theory (IRT).

## Engine Mechanics
1. **Initial Pool Allocation**: An expanded pool of questions (e.g., 200 questions for a 100-question exam) is loaded into the client's cache.
2. **Live Adjustment Algorithm**:
    - **Streak Bonus**: 3 consecutive correct answers trigger an escalation in difficulty (+1 IRT step).
    - **Struggle Penalty**: 2 consecutive incorrect answers on hard questions lower the difficulty (-1 IRT step).
3. **Target Challenge Level**: The engine attempts to keep the user challenged at a ~60-70% win rate to maximize psychometric measurement precision without inducing panic.

## Adaptive Scoring
Scores are no longer absolute (+1 for correct). They are weighted:
- Hard question correct: +3 points
- Easy question correct: +1 point
- Time efficiency multiplier applies to tie-breakers.
