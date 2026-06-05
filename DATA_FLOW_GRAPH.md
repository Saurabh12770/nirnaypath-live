# NirnayPath Core Data Flow Traces

This document details the precise step-by-step data pathways, database queries, and background asynchronous side-effects for the 9 core user journeys of the NirnayPath prep platform.

---

## 1. Signup Flow

```mermaid
sequenceDiagram
    autonumber
    Client ->> +AuthRouter: POST /api/auth/signup (email, password, name)
    AuthRouter ->> +UserModel: Query existing email: findOne({ email })
    UserModel -->> -AuthRouter: Null (Email is available)
    AuthRouter ->> AuthRouter: bcrypt.hash(password, 12 rounds)
    AuthRouter ->> +UserModel: Create user document (role="user", plan="free", status="active")
    UserModel -->> -AuthRouter: Saved User instance
    AuthRouter ->> +UserXPModel: Create XP profile (totalXP=0, level=1, currentStreak=0)
    UserXPModel -->> -AuthRouter: Saved XP instance
    AuthRouter -->> -Client: Response: 201 Created (Token + sanitized User profile)
```

---

## 2. Login Flow

```mermaid
sequenceDiagram
    autonumber
    Client ->> +AuthRouter: POST /api/auth/login (email, password)
    AuthRouter ->> +UserModel: Fetch email with password: findOne({ email }).select('+password')
    UserModel -->> -AuthRouter: User Object (with hashed password)
    AuthRouter ->> AuthRouter: bcrypt.compare(req.password, user.password)
    alt Password Invalid
        AuthRouter -->> Client: Response: 401 Unauthorized
    else Password Correct
        AuthRouter ->> AuthRouter: jwt.sign({ id: user._id }, JWT_SECRET, expires="1h")
        AuthRouter ->> AuthRouter: jwt.sign({ id: user._id }, REFRESH_SECRET, expires="7d")
        AuthRouter ->> +UserModel: Save refresh token to user.refreshTokens array
        UserModel -->> -AuthRouter: Updated User Object
        AuthRouter ->> AuthRouter: Set httpOnly cookie: token
        AuthRouter -->> -Client: Response: 200 OK (access token + user info)
    end
```

---

## 3. Start Test Flow (Crucial Mutex Path)

```mermaid
sequenceDiagram
    autonumber
    Client ->> +TestRouter: POST /api/test/start (subject, count, exam, topicId)
    TestRouter ->> TestRouter: Extract subject and normalize (lower, trim)
    
    Note over TestRouter, UserModel: ATOMIC MUTEX LAYER
    TestRouter ->> +UserModel: findOneAndUpdate({ _id: user._id, $or: [ { testStartLock: null }, { testStartLockExpiry: { $lt: now } } ] }, { testStartLock: reqId, testStartLockExpiry: now+15s })
    
    alt Lock Acquisition Failed (Duplicate /start parallel race)
        UserModel -->> TestRouter: Null (Lock is already held by other process)
        TestRouter -->> Client: Response: 409 Conflict (Session start in progress)
    else Lock Acquired Successfully
        UserModel -->> -TestRouter: User Object (Lock claimed)
        
        TestRouter ->> +QuestionSvc: getTestQuestions({ userId, subject, topicId, count })
        QuestionSvc ->> +QuestionPipeline: execute({ userId, subject, topicId, count })
        
        QuestionPipeline ->> +Repo: fetchQuestions(subject, topicId)
        Repo ->> Cache: getSnapshot(cacheKey)
        alt Cache Hit
            Cache -->> Repo: Questions Pool
        else Cache Miss
            Repo ->> DB/JSON: Read and compile questions
            Repo ->> Cache: setSnapshot(cacheKey)
            Repo -->> -QuestionPipeline: Questions Pool
        end
        
        QuestionPipeline ->> HistorySvc: getRecentQuestionWindowExclusions(userId)
        HistorySvc -->> QuestionPipeline: Set of seen IDs & Text fingerprints
        
        QuestionPipeline ->> SelectionEngine: select(filteredPool, targetCount)
        SelectionEngine -->> QuestionPipeline: Fisher-Yates Shuffled Array
        
        QuestionPipeline ->> ReserveManager: reserveAtomically(userId, selectedIds, sessionId)
        ReserveManager ->> QuestionReservationModel: insertMany(ordered=false)
        ReserveManager -->> QuestionPipeline: Success Boolean
        
        QuestionPipeline ->> ReserveManager: verifyInvariant(userId, selectedIds)
        ReserveManager -->> QuestionPipeline: Safe Boolean
        
        QuestionPipeline ->> ReserveManager: commit(userId, selectedIds)
        ReserveManager -->> QuestionPipeline: Committed
        
        QuestionPipeline -->> -QuestionSvc: { questions: SelectedQuestions, warning }
        QuestionSvc -->> -TestRouter: { questions: SelectedQuestions, warning }
        
        TestRouter ->> TestRouter: sanitizeForClient(questions) (Strips correctAnswer, explanation)
        
        TestRouter ->> TestSessionModel: updateMany({ status: "active" }, { status: "expired" })
        TestRouter ->> +TestSessionModel: Create new session document (status="active", startTime=now)
        TestSessionModel -->> -TestRouter: Saved Session
        
        TestRouter ->> +UserModel: Release Lock: findOneAndUpdate({ _id: user._id, testStartLock: reqId }, { testStartLock: null, testStartLockExpiry: null })
        UserModel -->> -TestRouter: User Object (Lock released)
        
        TestRouter -->> -Client: Response: 200 OK (sanitized questions + sessionId)
    end
```

---

## 4. Submit Test Flow (Scoring & Pipeline Triggering)

```mermaid
sequenceDiagram
    autonumber
    Client ->> +TestRouter: POST /api/test/submit (sessionId, answers)
    
    TestRouter ->> +TestSessionModel: findOneAndUpdate({ sessionId, status: "active" }, { status: "submitted" })
    alt Session Already Submitted or Expired
        TestSessionModel -->> TestRouter: Null / Duplicate Submit
        TestRouter -->> Client: Response: 400 Bad Request / 409 Conflict
    else Session Valid & Claimed
        TestSessionModel -->> -TestRouter: Active Session details
        
        TestRouter ->> TestRouter: Evaluate Score & Correct Answers (Loads full question keys from memory/DB)
        TestRouter ->> +TestResultModel: Create TestResult (score, correct, incorrect, fraudProbabilityScore)
        TestResultModel -->> -TestRouter: Saved TestResult
        
        TestRouter ->> +XPService: awardForTestSubmit(userId, testResult)
        XPService ->> +UserXPModel: Update totalXP, level, weeklyXP, rewardLog
        UserXPModel -->> -XPService: Updated XP profile
        XPService -->> TestRouter: Awards Summary (XP & Level Ups)
        
        TestRouter ->> +AchievementService: evaluateAfterTest(userId, testResult, totalTests, streak)
        AchievementService ->> UserXPModel: Append badge awards
        AchievementService -->> -TestRouter: Array of unlocked badges
        
        TestRouter ->> +QueueSvc: Push to "email-queue" (Job: SendResultEmail)
        QueueSvc ->> RedisQueue: LPUSH email-queue job
        QueueSvc -->> -TestRouter: Dispatched
        
        TestRouter ->> +CacheLayer: Invalidate user recommendation cache
        CacheLayer -->> -TestRouter: Cache cleared
        
        TestRouter -->> -Client: Response: 200 OK (Detailed score, correct answers, explanations, XP gains, badges)
    end
```

---

## 5. Review Test Flow

```mermaid
sequenceDiagram
    autonumber
    Client ->> +TestRouter: GET /api/test/review/:sessionId
    TestRouter ->> +TestResultModel: Find completed test result: findOne({ sessionId })
    TestResultModel -->> -TestRouter: TestResult document (containing full answers with explanations)
    
    Note over TestRouter: NO SANITIZATION
    Note right of TestRouter: Since the user has submitted the test, they are authorized to view answers.
    
    TestRouter -->> -Client: Response: 200 OK (Full question keys, selected answers, explanations_en/hi)
```

---

## 6. Dashboard Loading

```mermaid
sequenceDiagram
    autonumber
    Client ->> +UserRouter: GET /api/user/dashboard
    UserRouter ->> Cache: getCachedData("dashboard_stats_" + userId)
    alt Cache Hit
        Cache -->> UserRouter: Dashboard metrics
    else Cache Miss
        UserRouter ->> +TestResultModel: Count tests and gather average scores
        TestResultModel -->> UserRouter: Aggregated stats
        UserRouter ->> +XPService: getSummary(userId)
        XPService ->> +UserXPModel: Fetch level and currentStreak
        UserXPModel -->> -XPService: UserXP record
        XPService -->> -UserRouter: XP and Badge summary
        UserRouter ->> Cache: setCachedData("dashboard_stats_" + userId, data, 600s)
    end
    UserRouter -->> -Client: Response: 200 OK (Streak count, level, recent tests, XP summary)
```

---

## 7. Analytics & Exam Readiness Flow

```mermaid
sequenceDiagram
    autonumber
    Client ->> +AnalyticsRouter: GET /api/analytics/readiness
    AnalyticsRouter ->> +PerformanceAnalyticsSvc: getReadiness(userId)
    
    PerformanceAnalyticsSvc ->> PerformanceAnalyticsSvc: getOverview(userId) (Average Accuracy, total tests)
    PerformanceAnalyticsSvc ->> PerformanceAnalyticsSvc: getTopicMastery(userId) (Accuracy grouped by TopicId)
    
    alt Total Tests < 5
        PerformanceAnalyticsSvc -->> AnalyticsRouter: { readiness: null, message: "Take at least 5 tests..." }
    else Enough History Available
        PerformanceAnalyticsSvc ->> PerformanceAnalyticsSvc: Apply formula: (Accuracy * 0.5) + (Coverage * 0.3) + (CappedVolume * 0.4)
        PerformanceAnalyticsSvc -->> -AnalyticsRouter: { score: 0-100, confidence: "High/Medium/Low", factors }
    end
    
    AnalyticsRouter -->> -Client: Response: 200 OK (Readiness score metrics)
```

---

## 8. Leaderboard Loading Flow

```mermaid
sequenceDiagram
    autonumber
    Client ->> +LeaderboardRouter: GET /api/leaderboard/weekly
    LeaderboardRouter ->> Cache: getSnapshot("leaderboard_weekly")
    alt Cache Hit
        Cache -->> LeaderboardRouter: Leaderboard ranks array
    else Cache Miss
        LeaderboardRouter ->> +UserXPModel: Find users: find({ weeklyXP > 0 }).sort({ weeklyXP: -1 }).limit(100)
        UserXPModel -->> -LeaderboardRouter: Ranked User list
        LeaderboardRouter ->> Cache: setSnapshot("leaderboard_weekly", list, 300s)
    end
    LeaderboardRouter -->> -Client: Response: 200 OK (Ranks array)
```

---

## 9. Admin Operations Flow

```mermaid
sequenceDiagram
    autonumber
    Client ->> +AdminRouter: POST /api/admin/questions/bulk-upload
    AdminRouter ->> AdminRouter: Verify req.user.role === "admin"
    
    loop For each question in bulk array
        AdminRouter ->> AdminRouter: Normalize fields (examId, subjectId, correctAnswer index)
        AdminRouter ->> AdminRouter: Validate option arrays (Must have 4 entries)
        AdminRouter ->> +QuestionModel: save() question document
        QuestionModel -->> -AdminRouter: Success
    end
    
    AdminRouter ->> +CacheLayer: Invalidate cached subject questions pool
    CacheLayer -->> -AdminRouter: Invalidated
    
    AdminRouter -->> -Client: Response: 201 Created (Upload status & count)
```
