# NirnayPath 3.0 Folder Structure

This file defines the directory structure of the NirnayPath 3.0 codebase.

```
NirnayPath/
├── backend/                       # Express Node.js Server Application
│   ├── config/                    # Configuration configurations
│   │   └── db.js                  # Database connection setup
│   ├── middleware/                # Route Middlewares
│   │   ├── auth.js                # JWT verifying middleware
│   │   └── errorHandler.js        # Global Express error interceptor
│   ├── models/                    # Mongoose Database Models
│   │   ├── Bookmark.js
│   │   ├── LearningContent.js
│   │   ├── Question.js
│   │   ├── TestResult.js
│   │   ├── TestSession.js
│   │   └── User.js
│   ├── routes/                    # API Route Handlers
│   │   ├── admin.js               # Admin panel dashboard operations
│   │   ├── auth.js                # Authentication registration/login
│   │   ├── bookmarks.js           # Bookmarks CRUD
│   │   ├── dashboard.js           # Student stats calculations
│   │   ├── learn.js               # Learning content retrieval & progress
│   │   ├── syllabus.js            # Syllabus lists & exam details
│   │   └── tests.js               # Mock test management & submission
│   ├── scripts/                   # Development/Seeding utility scripts
│   │   ├── seedAll.js             # Entrypoint for database population
│   │   └── parseQuestions.js      # Utility to read & normalize questions
│   ├── app.js                     # Express entry point
│   ├── package.json               # Backend dependencies
│   └── .env                       # Backend local configuration variables
│
├── frontend/                      # React SPA Client (Vite, TailwindCSS)
│   ├── public/                    # Uncompiled assets
│   ├── src/                       # Source Directory
│   │   ├── assets/                # App images and logos
│   │   ├── components/            # Reusable UI Atoms & Organisms
│   │   │   ├── Common/            # Buttons, Inputs, Cards, Loader
│   │   │   ├── Layout/            # Navbars, Sidebars, App Wrappers
│   │   │   ├── Learn/             # SubtopicReader, ContentCard
│   │   │   ├── MockTest/          # QuestionSelector, Timer, TestReview
│   │   │   └── Admin/             # Admin specific widgets
│   │   ├── contexts/              # Global application contexts
│   │   │   └── AuthContext.jsx    # Auth token storage & session handling
│   │   ├── pages/                 # Full Page Layouts
│   │   │   ├── LandingPage.jsx    # Premium landing, Login & Register modals
│   │   │   ├── Dashboard.jsx      # Stats aggregator
│   │   │   ├── LearnHub.jsx       # Learn path browser
│   │   │   ├── TestCenter.jsx     # Mock exam interactive workspace
│   │   │   └── AdminPanel.jsx     # Content manager
│   │   ├── services/              # API Client Service Helpers
│   │   │   └── api.js             # Central Axios instance
│   │   ├── App.jsx                # Layout Router & page switches
│   │   ├── index.css              # Global styles & Tailwind configuration
│   │   └── main.jsx               # Client initialization element
│   ├── package.json               # Frontend dependencies
│   ├── tailwind.config.js         # Tailwind styling rules
│   └── vite.config.js             # Vite compilation setup
│
├── data/                          # Data store & initial assets
│   ├── questions/                 # Question JSON files (kept from legacy app)
│   ├── syllabus/                  # Syllabus JSON files for each supported exam
│   │   ├── banking.json
│   │   ├── bpsc.json
│   │   ├── railway.json
│   │   ├── ssc-cgl.json
│   │   ├── ssc-chsl.json
│   │   ├── state-pcs.json
│   │   └── upsc.json
│   └── content/                   # Initial Learn MD / JSON assets
│
└── docs/                          # Specifications and designs
    ├── API_SPECIFICATION.md
    ├── DATABASE_SCHEMA.md
    ├── FOLDER_STRUCTURE.md
    ├── IMPLEMENTATION_ROADMAP.md
    └── PROJECT_ARCHITECTURE.md
```
