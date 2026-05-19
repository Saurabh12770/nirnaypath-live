# Exam Orchestrator Architecture

## Overview
The `ExamOrchestrator` manages the lifecycle of massive, synchronized live exams.

## Lifecycle Management
1. **Pre-Exam (T-48 Hours)**: Admit card generation, center allocation placeholders.
2. **Exam Window (Live)**:
   - Shift locking (users cannot enter outside their window).
   - Real-time attendance state propagation.
3. **Post-Exam**:
   - Mass answer key release.
   - Live result processing pipeline activation.

## Features
- Support for strictly scheduled exam windows (e.g., 10:00 AM - 12:00 PM).
- Dynamic heartbeat orchestration across active shifts.
