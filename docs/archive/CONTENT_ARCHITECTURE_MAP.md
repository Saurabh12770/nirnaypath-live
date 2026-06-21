# NirnayPath 3.0 — Content Architecture Map

This document outlines the exact content architecture and data flow for the two primary engines of the NirnayPath platform: the **Study Content Engine (LearnHub)** and the **Mock Test Engine (TestCenter)**.

---

## 📖 1. Study Content Engine (LearnHub)

The Study Content Engine serves structured, markdown-compatible coaching notes, revision guides, and exam resources.

### Data Flow Diagram

```mermaid
graph TD
    A[LearnHub.jsx (Frontend Page)] -->|HTTP GET /api/learn/content/:exam/:subject/:topic/:subtopic| B[Express Router (learn.js)]
    B -->|Query & Optional Upsert| C[Mongoose Model (LearningContent.js)]
    C -->|Reads/Writes| D[MongoDB Collection (learningcontents)]
    E[Seeder Files (scripts/*)] -->|Bulk Seeding / Content Injection| D
```

### Architectural Details

*   **Frontend Component**: [LearnHub.jsx](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/frontend/src/pages/LearnHub.jsx)
    *   *Role*: Displays subject outlines, topic/subtopic trees, reading time indicators, learning progress checkboxes, and a rich markdown study console.
*   **API Endpoint**: `GET /api/learn/content/:exam/:subject/:topic/:subtopic`
*   **Backend Route File**: [learn.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/routes/learn.js)
*   **Controller Action**: Handles incoming parameters, performs a case-insensitive search, and uses Mongoose `findOneAndUpdate` with `upsert: true` to return existing content or register a placeholder.
*   **Mongoose Model**: [LearningContent.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/models/LearningContent.js)
*   **MongoDB Collection**: `learningcontents`
*   **Content Seeder Scripts**:
    *   [seedContent.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedContent.js)
    *   [seedDeepContent.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedDeepContent.js)
    *   [seedContentFactory.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedContentFactory.js)
    *   [seedContentFactory2.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedContentFactory2.js)
    *   [seedContentFactory3.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedContentFactory3.js)
    *   [seedContentFactory4.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedContentFactory4.js)
    *   [seedAcademicUpdates.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedAcademicUpdates.js)
    *   [seedMicro_UPSC_History.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedMicro_UPSC_History.js)
    *   [seedMicro_UPSC_PolGeoEco.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedMicro_UPSC_PolGeoEco.js)
    *   [seedMissingContent.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedMissingContent.js)

---

## 🎯 2. Mock Test Engine (TestCenter)

The Mock Test Engine configures exam filters, initiates randomized mock sessions, captures answers in real-time, and scores results.

### Data Flow Diagram

```mermaid
graph TD
    A[TestCenter.jsx (Frontend Page)] -->|HTTP POST /api/tests/sessions| B[Express Router (tests.js)]
    B -->|Random Sample $sample| C[Mongoose Model (Question.js)]
    C -->|Query Questions| D[MongoDB Collection (questions)]
    B -->|Creates Session| E[Mongoose Model (TestSession.js)]
    E -->|Inserts Record| F[MongoDB Collection (testsessions)]
    A -->|Submit Answers & Complete| G[HTTP POST /api/tests/sessions/:sessionId/submit]
    G -->|Generates Result| H[Mongoose Model (TestResult.js)]
    H -->|Inserts Record| I[MongoDB Collection (testresults)]
    J[Question Seeder Files (scripts/*)] -->|Bulk Seeding / Mapping| D
```

### Architectural Details

*   **Frontend Component**: [TestCenter.jsx](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/frontend/src/pages/TestCenter.jsx)
    *   *Role*: Provides test wizards, timed exam environments, interactive question palettes, and radial scoreboards.
*   **Core API Endpoints**:
    *   `POST /api/tests/sessions` (Create test session)
    *   `GET /api/tests/sessions/:sessionId` (Get session)
    *   `POST /api/tests/sessions/:sessionId/answers` (Submit answer)
    *   `POST /api/tests/sessions/:sessionId/submit` (Finish and calculate results)
*   **Backend Route File**: [tests.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/routes/tests.js)
*   **Mongoose Models & MongoDB Collections**:
    *   [Question.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/models/Question.js) ➔ `questions` collection
    *   [TestSession.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/models/TestSession.js) ➔ `testsessions` collection
    *   [TestResult.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/models/TestResult.js) ➔ `testresults` collection
*   **Question Import Source Files**: Data sources located in [data/questions/](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/data/questions/):
    *   `bihar.json` (BPSC Questions)
    *   `math.json` (Math Questions for SSC/Banking)
    *   `reasoning.json` (Reasoning Questions)
    *   `english.json` (English Grammar/Vocab Questions)
    *   `general_awareness.json` (GK Questions)
*   **Question Seeder Scripts**:
    *   [seedAll.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedAll.js)
    *   [seedQuestions_SSC_CHSL.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedQuestions_SSC_CHSL.js)
    *   [seedQuestionsLargePools.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedQuestionsLargePools.js)
    *   [seedSubtopicNormalization.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedSubtopicNormalization.js)
    *   [seedSubtopicMapper.js](file:///c:/Users/SAURABH%20KUMAR/Desktop/NirnayPath/backend/scripts/seedSubtopicMapper.js)
