# Shift Normalization Engine
## 1. Overview
To ensure fairness across multiple shifts of the same exam (e.g., SSC, Railway where exams span days), NirnayPath implements a government-grade statistical normalization engine.

## 2. Normalization Methodology
We utilize a combination of Z-Score and Percentile Equating, standard in NTA and GATE methodologies.

### The Formula
`M(ij) = [(M(tg) - M(qg)) / (M(ti) - M(qi))] * (X(ij) - M(qi)) + M(qg)`

Where:
- `M(ij)`: Normalized marks of the j-th candidate in the i-th shift.
- `M(tg)`: Average marks of the top 0.1% of candidates considering all shifts.
- `M(qg)`: Sum of mean and standard deviation marks of candidates across all shifts.
- `M(ti)`: Average marks of the top 0.1% of candidates in the i-th shift.
- `M(qi)`: Sum of mean and standard deviation marks of candidates in the i-th shift.
- `X(ij)`: Actual raw marks obtained by the candidate.

## 3. Difficulty Balancing & Confidence Intervals
- The engine calculates the inherent "Difficulty Index" of each shift based on the average performance of the middle 50% of candidates.
- If a shift's Difficulty Index falls outside a 95% statistical confidence interval (i.e., a paper was accidentally made absurdly hard), an additional baseline adjustment factor is applied.

## 4. Execution Architecture
- Normalization cannot happen in real-time. It requires the entire dataset of all shifts to be finalized.
- **Workflow**:
  1. Exam window closes.
  2. Fraud elimination pass runs.
  3. `normalization-worker.js` spins up.
  4. Fetches raw scores from MongoDB.
  5. Computes `M(tg)`, `M(qg)`, etc.
  6. Updates the `normalizedScore` field in `TestResult` in batches.
  7. Triggers the National Ranking Engine to regenerate AIR based on `normalizedScore`.
