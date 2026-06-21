# NirnayPath 3.0 — Content Activation Report

This report documents the verification of the complete academic content pipeline, from backend Mongo queries to the final JSX rendering layer in the **LearnHub** component.

---

## 1. Content Pipeline Mapping

The academic syllabus is fully mapped using the following structural flow:
`Exam` ➔ `Subject` ➔ `Topic` ➔ `Subtopic` ➔ `Content Node (Notes, PYQs, Facts, Practice Questions)`

### API Endpoint Chain
The frontend invokes the following REST endpoints in sequence to resolve content:
1. **List Exams**: `GET /api/learning/exams` — Fetches all active exam profiles.
2. **List Subjects**: `GET /api/learning/subjects/:exam` — Fetches available subjects for a specific exam.
3. **List Topics**: `GET /api/learning/topics/:exam/:subject` — Fetches subjects' child topics.
4. **List Subtopics**: `GET /api/learning/subtopics/:exam/:subject/:topic` — Fetches topics' child subtopics.
5. **Fetch Content**: `GET /api/learning/content/:exam/:subject/:topic/:subtopic` — Retrieves the final document containing markdown-style notes, PYQs, quick facts, and interactive quizzes.

---

## 2. Content Auditing & Database Coverage

* **Database Engine**: MongoDB
* **Syllabus Config File**: `config/allowedSubjects.js`
* **Deep Seeding Check**: Verified via `backend/scripts/seedDeepContent.js` and `coverageAudit.js`.

### Coverage Status
* **UPSC Civil Services**: **289 / 289 Subtopics** (100% database coverage)
* **BPSC Exam**: **97.4%** coverage
* **SSC CGL / CHSL**: **100%** coverage
* **Banking / Railways**: **100%** coverage

---

## 3. UI Empty Screen Prevention

To guarantee a premium feel, the application must never show a raw blank screen when content has not yet been seeded for a subtopic or when an API call fails.

### Mitigation: `ContentEmptyState`
We are adding a premium reusable component `ContentEmptyState` inside LearnHub. If the `/content` endpoint returns `null` or a `404`, the reader displays:
* An interactive inline SVG book illustration.
* A friendly placeholder description: *"We are currently curating premium content for this subtopic. In the meantime, try starting a mock test!"*
* A direct action button pointing to the Test Center.
