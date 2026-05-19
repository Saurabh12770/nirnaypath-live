# ADVANCED SEARCH & KNOWLEDGE GRAPH ARCHITECTURE

## Objective
Transform NirnayPath from a transactional CBT engine into an intelligent EdTech discovery platform by linking candidates, educators, topics, and exams semantically.

## Core Capabilities
1. **Semantic Search:** Go beyond keyword matching. Searching "Python for beginners" should yield algorithms, basic syntax tests, and logic puzzles.
2. **Related Exam Discovery:** "Candidates who took Exam A also benefited from Exam B."
3. **Educator-Topic Relationships:** Maps which institutions/creators are authoritative in specific domains (e.g., "UPSC History").
4. **Adaptive Content Mapping:** Automatically links weak areas from CBT results to corrective learning modules in the EdTech marketplace.

## Technical Implementation
- **Data Structure:** Migrating towards a graph representation (or simulated graph via MongoDB `$graphLookup` + Redis caching).
- **Async Indexing:** Changes to questions or exams are indexed asynchronously via an event bus to avoid write latency.
