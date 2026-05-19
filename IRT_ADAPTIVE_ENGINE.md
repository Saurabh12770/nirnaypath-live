# Item Response Theory (IRT) Adaptive Engine
## 1. Overview
Moving away from static difficulty, the IRT Adaptive Engine dynamically adjusts the exam's difficulty based on the candidate's real-time performance. This provides a more precise assessment of ability and prevents cheating through question-sharing.

## 2. IRT Core Principles
- **Ability Parameter (θ)**: The candidate's true skill level, updated after every answer.
- **Difficulty Parameter (b)**: The inherent difficulty of the question.
- **Discrimination Parameter (a)**: How well the question distinguishes between high-ability and low-ability candidates.
- **Guessing Parameter (c)**: The probability of getting the question right by random guessing.

## 3. Dynamic Difficulty Adjustment
1. **Initialization**: All candidates start with a median Ability Parameter (θ = 0).
2. **Next Question Selection**: The engine selects a question from the pool where the Difficulty (b) matches the candidate's current Ability (θ).
3. **Update Mechanism**: 
   - Correct answer: θ increases (next question is harder).
   - Incorrect answer: θ decreases (next question is easier).
4. **Confidence Weighting**: Faster answers with fewer changes result in larger θ increases. High hesitation reduces the θ increase.

## 4. Cheat-Resistance & Fairness
- **Hidden Calibration Questions**: 10% of questions are unscored "calibration" items used to determine the (a), (b), and (c) parameters across the national cohort.
- **Question Pools**: Questions are drawn from massive, dynamically generated pools (e.g., Combinatorial CS Question Bank). No two candidates receive the exact same sequence of questions.
- **Difficulty Bands**: Ensures a balanced mix of topics regardless of the difficulty level.

## 5. Real-Time Adaptation Architecture
- **In-Memory State**: The candidate's θ is maintained in Redis (`exam:irt:state:{sessionId}`) for ultra-fast reads/updates during the exam.
- **Pre-fetching**: The engine always pre-fetches the next 3 possible questions (Easy, Medium, Hard) to ensure zero latency between question transitions.
- **Fallback Mechanism**: If Redis fails, the system falls back to a static, pre-generated paper (ensuring Railway deployment resilience).
