# AI Analytics Pipeline
## 1. Overview
Calculating psychometric scores (Confidence, Panic, Careless Mistakes) inline during the exam submission blocks the event loop and increases response latency. The new AI Analytics Pipeline pushes these calculations to asynchronous background workers.

## 2. Worker Execution Model
File: `workers/ai-perf-worker.js`

### Trigger Mechanisms
1. **End-of-Exam Hook**: When a `TestSession` status changes to `submitted`, a job is pushed to the Analytics Queue.
2. **Periodic Cron (Optional)**: Can run on active sessions periodically to update live dashboard metrics if required.

### Processing Steps
1. Fetches all `QuestionTelemetry` events for the `sessionId`.
2. Computes **Confidence Score**: Weights correct answers against `hesitationCount` and `answerChanges`.
3. Computes **Panic Score**: Looks for rapid `window_blur` events or erratic answer changes.
4. Computes **Careless Mistake Index**: Correlates high-success-rate questions answered incorrectly with very low `timeSpentMs`.
5. Updates the `TestSession` document with the final metrics.

## 3. Scale Considerations
- Uses BullMQ or lightweight Redis queues to distribute processing across multiple PM2 instances.
- If the worker queue backs up, API performance is unaffected. The candidate's dashboard will simply show "AI Analytics Pending..." until processed.
