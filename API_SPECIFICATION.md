# NirnayPath 3.0 API Specification

This document details the REST API specifications for the Express backend of NirnayPath 3.0. All endpoints prefix: `/api`.

---

## 1. Authentication Endpoints (`/auth`)

### 1.1 User Registration
- **Method**: `POST`
- **Path**: `/auth/register`
- **Body**:
  ```json
  {
    "name": "Saurabh Kumar",
    "email": "student@nirnaypath.local",
    "password": "strongpassword123"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": { "id": "userId", "name": "Saurabh Kumar", "email": "student@nirnaypath.local", "role": "student" }
  }
  ```

### 1.2 User Login
- **Method**: `POST`
- **Path**: `/auth/login`
- **Body**:
  ```json
  {
    "email": "student@nirnaypath.local",
    "password": "strongpassword123"
  }
  ```
- **Response** (200 OK): Sets HTTP-only cookies containing `accessToken` and `refreshToken`. Returns:
  ```json
  {
    "success": true,
    "user": { "id": "userId", "name": "Saurabh Kumar", "email": "student@nirnaypath.local", "role": "student" }
  }
  ```

### 1.3 User Logout
- **Method**: `POST`
- **Path**: `/auth/logout`
- **Response** (200 OK): Clears the auth cookies.

### 1.4 Get Current User State
- **Method**: `GET`
- **Path**: `/auth/me`
- **Headers**: Authorization header or session cookies required.
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "user": { "id": "userId", "name": "Saurabh Kumar", "email": "student@nirnaypath.local", "role": "student" }
  }
  ```

---

## 2. Syllabus Endpoints (`/syllabus`)

### 2.1 Get All Available Exams & Outline
- **Method**: `GET`
- **Path**: `/syllabus`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "exams": [
      { "id": "UPSC", "name": "UPSC Civil Services", "subjects": [...] },
      { "id": "BPSC", "name": "BPSC Civil Services", "subjects": [...] }
    ]
  }
  ```

### 2.2 Get Detailed Syllabus for a Specific Exam
- **Method**: `GET`
- **Path**: `/syllabus/:exam`
- **Response** (200 OK): Contains full hierarchical mapping of Exam → Subject → Topic → Subtopics.

---

## 3. Learn Platform Endpoints (`/learn`)

### 3.1 Get Subtopic Study Content
- **Method**: `GET`
- **Path**: `/learn/content/:exam/:subject/:topic/:subtopic`
- **Response** (200 OK): Returns rich content structure for the subtopic.
  ```json
  {
    "success": true,
    "content": {
      "subtopic": "Indus Valley Civilization",
      "introduction": "...",
      "detailedExplanation": "...",
      "concepts": ["...", "..."],
      "importantFacts": ["...", "..."],
      "examples": [],
      "tables": [],
      "revisionNotes": "...",
      "pyqs": [...],
      "practiceMcqs": [...]
    }
  }
  ```

### 3.2 Update User Learning Progress
- **Method**: `POST`
- **Path**: `/learn/progress`
- **Body**:
  ```json
  {
    "exam": "UPSC",
    "subject": "History",
    "topic": "Ancient India",
    "subtopic": "Indus Valley Civilization",
    "completed": true
  }
  ```
- **Response** (200 OK): Returns updated learning progress map.

---

## 4. Mock Test Platform Endpoints (`/tests`)

### 4.1 Create Test Session
- **Method**: `POST`
- **Path**: `/tests/sessions`
- **Body**:
  ```json
  {
    "testType": "topic", // 'topic' | 'subject' | 'full_mock'
    "exam": "UPSC",
    "subject": "History",      // Required if type is topic/subject
    "topic": "Ancient India", // Required if type is topic
    "subtopic": "Indus Valley Civilization" // Optional
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "session": {
      "id": "sessionId",
      "questions": [ { "id": "...", "question": { "en": "..." }, "options": [...] } ],
      "timeRemaining": 1800,
      "status": "active"
    }
  }
  ```

### 4.2 Save Answer Progress
- **Method**: `PUT`
- **Path**: `/tests/sessions/:id`
- **Body**:
  ```json
  {
    "answers": {
      "questionId1": 2, // Question ID -> option index
      "questionId2": 0
    },
    "timeRemaining": 1750
  }
  ```
- **Response** (200 OK):
  ```json
  { "success": true }
  ```

### 4.3 Submit Test Session
- **Method**: `POST`
- **Path**: `/tests/sessions/:id/submit`
- **Response** (200 OK): Grades the session, creates a `testresult` record, and returns results.
  ```json
  {
    "success": true,
    "result": {
      "id": "resultId",
      "score": 8,
      "totalQuestions": 10,
      "correctAnswers": 8,
      "wrongAnswers": 2,
      "unattempted": 0,
      "accuracy": 80,
      "duration": 50,
      "analysis": {
        "strongTopics": ["Ancient India"],
        "weakTopics": []
      }
    }
  }
  ```

### 4.4 Get Test Result Detail
- **Method**: `GET`
- **Path**: `/tests/results/:id`
- **Response** (200 OK): Returns graded results with question explanation details.

### 4.5 Get User Test Attempt History
- **Method**: `GET`
- **Path**: `/tests/history`
- **Response** (200 OK): List of past `testresults` with scores, timestamps, and accuracy.

---

## 5. Bookmark Endpoints (`/bookmarks`)

### 5.1 Add Bookmark
- **Method**: `POST`
- **Path**: `/bookmarks`
- **Body**:
  ```json
  {
    "type": "question", // 'question' | 'content'
    "targetId": "objectId"
  }
  ```
- **Response** (201 Created): Successful bookmark payload.

### 5.2 Get User Bookmarks
- **Method**: `GET`
- **Path**: `/bookmarks`
- **Response** (200 OK): List of bookmarked items.

### 5.3 Remove Bookmark
- **Method**: `DELETE`
- **Path**: `/bookmarks/:id`
- **Response** (200 OK)

---

## 6. Dashboard Endpoint (`/dashboard`)

### 6.1 Get Combined Statistics Dashboard
- **Method**: `GET`
- **Path**: `/dashboard/summary`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "stats": {
      "testsAttempted": 12,
      "accuracy": 78.5,
      "weakTopics": ["Medieval India"],
      "strongTopics": ["Ancient India", "Polity"],
      "learningProgress": 35.5, // overall % completed
      "recentActivity": [
        { "type": "test", "label": "Ancient India Topic Test", "score": 80, "date": "2026-06-07T12:00:00Z" },
        { "type": "learn", "label": "Indus Valley Civilization completed", "date": "2026-06-07T11:30:00Z" }
      ],
      "performanceTrend": [
        { "date": "2026-06-01", "accuracy": 70 },
        { "date": "2026-06-07", "accuracy": 78.5 }
      ]
    }
  }
  ```

---

## 7. Admin Endpoints (`/admin` — Admin-only role)

### 7.1 Questions CRUD
- `GET /admin/questions` - Paginated questions list
- `POST /admin/questions` - Create question
- `PUT /admin/questions/:id` - Update question
- `DELETE /admin/questions/:id` - Delete question

### 7.2 Syllabus CRUD
- `PUT /admin/syllabus/:exam` - Update/overwrite exam syllabus mapping

### 7.3 Learning Content CRUD
- `POST /admin/content` - Create learning content details
- `PUT /admin/content/:id` - Update learning content details

### 7.4 Users CRUD
- `GET /admin/users` - List users (paginated)
- `PUT /admin/users/:id/role` - Toggle student/admin role

### 7.5 Reports Dashboard
- `GET /admin/reports` - Fetch administrative metrics (total attempts, registration growth rate, most failed topics)
