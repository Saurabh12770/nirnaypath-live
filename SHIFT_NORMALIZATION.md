# Shift Normalization Engine

## Overview
The `ShiftNormalizationEngine` ensures fairness across multi-shift exams by adjusting scores based on the statistical difficulty of each shift.

## Statistical Model (Equi-Percentile / Mean-Standard Deviation)
Follows standard government normalization rules (SSC/GATE):
`Normalized_Score = ( (S2 / S1) * (Raw_Score - X) ) + Y`
Where:
- `S2`: Standard deviation of the shift with the highest average score.
- `S1`: Standard deviation of the candidate's shift.
- `X`: Average score of the candidate's shift.
- `Y`: Average score of the base shift.

## Features
- Multi-shift dynamic balancing.
- Normalization scaling.
- Prevention of negative normalized scores via base floor mapping.
