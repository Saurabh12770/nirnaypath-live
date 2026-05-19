# AI Performance Intelligence Engine
## 1. Overview
The AI Performance Engine replaces static scores with multi-dimensional psychometric analysis. It processes Question Telemetry to generate deep insights into a candidate's behavior, stress, and learning gaps.

## 2. Behavioral Metrics
### Confidence Score (0-100)
**Formula**: `(Correct Answers / (HesitationCount + AnswerChanges + 1)) * (IdealTime / ActualTime)`
*High score*: Fast, correct, no answer changes.
*Low score*: Slow, multiple answer changes, high hesitation.

### Stress/Panic Probability
Triggered by: Rapid sequential incorrect answers, sudden spikes in `timeSpentMs` on easy questions, and erratic mouse movements (captured in `riskFlags`).

### Careless Mistake Index
Triggered when a candidate answers a historically "easy" (high success rate) question incorrectly, but with a very low `timeSpentMs` (e.g., < 10 seconds on a 60-second question).

### Overthinking Index
Triggered when a candidate answers a question incorrectly (or changes a correct answer to incorrect) after spending > 200% of the `idealTime`.

## 3. Learning Metrics & Topic Prediction
- **Weak Topic Prediction**: Aggregates `timeSpentMs` and `accuracy` across granular topic tags (e.g., "DBMS Normalization").
- **Conceptual Instability**: High variance in accuracy within a single topic (e.g., getting hard questions right but easy questions wrong).
- **Revision Urgency**: Topics with a high "Careless Mistake Index" coupled with low "Confidence Scores".

## 4. Time Intelligence
- **Ideal Time-Per-Question**: Continuously calculated using the median time of the top 10% of candidates for that specific question.
- **Wasted Time Heatmaps**: Identifies segments of the exam where the candidate spent time without submitting an answer or gaining marks.

## 5. Async Worker Architecture
1. **Event Source**: Aggregated data from the `QuestionTelemetry` MongoDB collection.
2. **Processor**: A dedicated PM2 worker (`ai-perf-worker.js`) runs at the end of every exam session.
3. **Storage**: Results are saved to a new `PerformanceIntelligence` collection.
4. **API Layer**: Served via GraphQL/REST to the candidate dashboard, completely decoupled from the transactional `TestSession` API.
