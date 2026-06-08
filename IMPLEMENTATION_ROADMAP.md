# NirnayPath 3.0 Implementation Roadmap

This document outlines the step-by-step milestones to rebuild NirnayPath from scratch.

---

## Phase 1: Environment Setup & Data Structuring
**Goal**: Build the directories, configure packages, and organize static inputs.

- [ ] Create folder structure directories (`backend/`, `frontend/`, `data/questions/`, `data/syllabus/`, `data/content/`, `docs/`).
- [ ] Move existing question JSON files in `data/*.json` into `data/questions/` to isolate them.
- [ ] Write syllabus schemas for `upsc.json`, `bpsc.json`, `ssc-cgl.json`, `ssc-chsl.json`, `railway.json`, `banking.json`, and `state-pcs.json`.
- [ ] Setup configurations in `backend/` and initialize React app in `frontend/` using Vite + TailwindCSS.

---

## Phase 2: Database Layer & Data Seeding
**Goal**: Implement Mongoose schemas and seed the initial dataset.

- [ ] Create Mongoose models for `users`, `questions`, `testsessions`, `testresults`, `learning_content`, and `bookmarks`.
- [ ] Write a seeding script (`backend/scripts/seedAll.js`) to:
  - Load and normalize questions from `data/questions/` (handling bilingual maps, formatting, and indexing).
  - Parse syllabus files and seed them.
  - Create standard Admin credentials and dummy student credentials.
  - Populate initial study note documents in `learning_content` for sample topics.

---

## Phase 3: Backend API Development
**Goal**: Build functional endpoints with strict authorization.

- [ ] Implement user registration, login, logout, and token session verification (`/api/auth`).
- [ ] Implement syllabus retrieval endpoints (`/api/syllabus`).
- [ ] Implement learning content views, related topics, and progress updates (`/api/learn`).
- [ ] Build test session creator, option autosave, and grading submission engine (`/api/tests`).
- [ ] Develop bookmarks addition, checking, and removal (`/api/bookmarks`).
- [ ] Implement aggregations for student dashboard analytics (`/api/dashboard`).
- [ ] Implement admin controls for CRUD editing (`/api/admin`).

---

## Phase 4: Frontend Development
**Goal**: Build a premium, mobile-first, and highly-responsive user experience.

- [ ] Create layout modules: header navigation, sidebar panels, modal forms, and loading states.
- [ ] Setup Auth context & HTTP services.
- [ ] Build **Landing Page**: elegant color palette, authentication forms, and landing illustrations.
- [ ] Build **Dashboard Page**: accuracy graphs, strong/weak tags, and progress tracker.
- [ ] Build **Learn Platform UI**: hierarchical sidebar navigation, detailed content renderer, PYQs, and MCQs practice.
- [ ] Build **Mock Test UI**: active test interface, timer, question navigation (attempted/flagged/unvisited), test submission screen, and post-test breakdown.
- [ ] Build **Admin Console**: forms to edit questions, syllabus, and study notes.

---

## Phase 5: Verification & Performance Auditing
**Goal**: Ensure compliance with performance targets and security rules.

- [ ] Ensure DB indexing prevents collection scans. Check execution times for:
  - User Dashboard: `< 1s`
  - Active Test Retrieval: `< 1s`
  - Landing Load: `< 2s`
- [ ] Run functional test cases for session creation and submission.
- [ ] Deliver final documentation.
