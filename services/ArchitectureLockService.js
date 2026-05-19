'use strict';

/**
 * ArchitectureLockService — Phase 19A
 * =====================================
 * Runtime validator: detects rogue services, duplicate cache layers,
 * ghost Redis clients, mock telemetry. NEVER throws. WARNING logs only.
 */

const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

const REGISTERED_SERVICES = new Set([
    'services/redisService.js','services/cacheLayer.js','services/cacheCoordinatorService.js',
    'services/distributedLockService.js','services/circuitBreakerService.js',
    'services/crashReportingService.js','services/queueService.js','services/workerService.js',
    'services/cronService.js','services/socketService.js','services/questionRepository.js',
    'services/questionRuntimeEngine.js','services/questionReservationService.js',
    'services/dedupEngine.js','services/questionGenerationService.js',
    'services/questionQualityService.js','services/selectionEngine.js',
    'services/questionService.js','services/contentApprovalService.js',
    'services/reviewQueueService.js','core/questionPipeline.js',
    'services/historyService.js','services/performanceAnalyticsService.js',
    'services/adaptiveLearningService.js','services/studentLearningProfileService.js',
    'services/syllabusIntelligenceService.js','services/emailService.js',
    'services/emailDigest.js','services/emailMetrics.js','services/notificationService.js',
    'services/pushService.js','services/semanticFirewallService.js',
    'services/semanticDedupService.js','services/aiService.js',
    'services/memoryPressureService.js','services/contentRepairService.js',
    'services/explanationQualityService.js','services/topicTaxonomyService.js',
    'services/subscriptionService.js','services/badgeService.js',
    'services/OperationsTelemetryService.js',
    'middleware/rateLimiter.js','middleware/auth.js','middleware/adminAuth.js',
    'middleware/planGuard.js','middleware/premium.js','middleware/runtimeProtection.js',
    'middleware/cache.js',
    'utils/logger.js','utils/context.js','utils/eventLoopSafeguard.js',
    'utils/runtimeTrace.js','utils/productionMonitor.js','utils/fileUtils.js',
    'utils/topicNormalizer.js','utils/questionLoader.js','utils/questionNormalizer.js',
    'utils/questionFingerprint.js','utils/sanitizeQuestions.js',
    'utils/questionIntegrityService.js','utils/questionSelectionService.js',
    'utils/normalizePipelineResult.js',
    'config/featureFlags.js','config/allowedSubjects.js','config/plans.js','config/sections.js',
]);

const ROGUE_PATTERNS = [
    { pattern: 'services/NotificationCenterService.js', reason: 'Creates bare new Redis() with no URL/error-handler. FM-010.', severity: 'HIGH' },
    { pattern: 'services/SelfHealingInfrastructureEngine.js', reason: 'checkRedisPressure() uses Math.random() — mock telemetry.', severity: 'MEDIUM' },
    { pattern: 'services/GovernanceIntelligenceEngine.js', reason: 'All methods return mock/static data.', severity: 'LOW' },
    { pattern: 'services/TelemetryIngestService.js', reason: 'Redis xAdd commented out — no-op stub in production.', severity: 'MEDIUM' },
];

const DUPLICATE_RESPONSIBILITY_VIOLATIONS = [
    {
        responsibility: 'Redis Client Management',
        canonical: 'services/redisService.js',
        rogues: ['middleware/cache.js (FM-006)', 'services/NotificationCenterService.js (FM-010)', 'workers/ai-perf-worker.js'],
    },
    {
        responsibility: 'In-Process Cache',
        canonical: 'services/cacheLayer.js',
        rogues: ['middleware/cache.js (maintains own localCache Map)'],
    },
    {
        responsibility: 'Event Loop Lag Measurement',
        canonical: 'routes/health.js',
        rogues: ['services/OperationsTelemetryService.js (duplicate implementation)'],
    },
    {
        responsibility: 'Mongo Replication Lag',
        canonical: 'routes/health.js (real admin().ping())',
        rogues: ['services/OperationsTelemetryService.js (Math.random() — FAKE)'],
    },
];

class ArchitectureLockService {
    static _driftReport = { timestamp: null, rogueModules: [], duplicateViolations: [], unregisteredModules: [], warnings: [], summary: null };

    static runStartupValidation() {
        this._driftReport.timestamp = new Date().toISOString();
        this._driftReport.rogueModules = [];
        this._driftReport.duplicateViolations = [];
        this._driftReport.unregisteredModules = [];
        this._driftReport.warnings = [];

        logger.warn('[ARCH-LOCK] ══ Architecture Lock Validation Starting ══');
        this._detectRogueModules();
        this._detectDuplicateResponsibilities();
        this._detectUnregisteredModulesInCache();
        this._detectRogueRedisClients();

        const totalIssues = this._driftReport.rogueModules.length +
            this._driftReport.duplicateViolations.length +
            this._driftReport.unregisteredModules.length;

        this._driftReport.summary = { totalDriftIssues: totalIssues, status: totalIssues === 0 ? 'CLEAN' : 'DRIFT_DETECTED' };

        if (totalIssues === 0) {
            logger.info('[ARCH-LOCK] ✅ Architecture validation PASSED. Zero drift detected.');
        } else {
            logger.warn(`[ARCH-LOCK] ⚠️  Drift detected. Total issues: ${totalIssues}. Call getDriftReport().`);
        }
        logger.warn('[ARCH-LOCK] ══ Architecture Lock Validation Complete ══');
        this._writeDriftReportToDisk();
        return this._driftReport;
    }

    static _detectRogueModules() {
        const loadedModules = Object.keys(require.cache);
        for (const rogue of ROGUE_PATTERNS) {
            const isLoaded = loadedModules.some(m => m.includes(rogue.pattern.replace(/\//g, path.sep)));
            if (isLoaded) {
                logger.warn(`[ARCH-LOCK][ROGUE][${rogue.severity}] ${rogue.pattern} — ${rogue.reason}`);
                this._driftReport.rogueModules.push({ module: rogue.pattern, reason: rogue.reason, severity: rogue.severity });
            }
        }
    }

    static _detectDuplicateResponsibilities() {
        for (const v of DUPLICATE_RESPONSIBILITY_VIOLATIONS) {
            logger.warn(`[ARCH-LOCK][DUPLICATE] "${v.responsibility}" → Canonical: ${v.canonical} | Rogues: ${v.rogues.join(', ')}`);
            this._driftReport.duplicateViolations.push(v);
        }
    }

    static _detectUnregisteredModulesInCache() {
        const loadedModules = Object.keys(require.cache);
        const rootDir = process.cwd().replace(/\\/g, '/');
        for (const mod of loadedModules) {
            const normalized = mod.replace(/\\/g, '/');
            if (!normalized.includes(rootDir) || normalized.includes('node_modules')) continue;
            const rel = normalized.replace(rootDir + '/', '');
            if (rel === 'app.js' || rel.startsWith('scripts/') || rel.startsWith('workers/') || rel.startsWith('schemas/')) continue;
            const isRegistered = Array.from(REGISTERED_SERVICES).some(s => rel.endsWith(s));
            if (!isRegistered) {
                logger.warn(`[ARCH-LOCK][UNREGISTERED] Not in registry: ${rel}`);
                this._driftReport.unregisteredModules.push(rel);
            }
        }
    }

    static _detectRogueRedisClients() {
        const rogueFiles = ['middleware/cache.js', 'services/NotificationCenterService.js', 'workers/ai-perf-worker.js'];
        const loadedModules = Object.keys(require.cache);
        for (const rogueFile of rogueFiles) {
            const isLoaded = loadedModules.some(m => m.includes(rogueFile.replace(/\//g, path.sep)));
            if (isLoaded) {
                logger.warn(`[ARCH-LOCK][REDIS-ROGUE] ${rogueFile} loaded with own ioredis client. Bypasses redisService.js monitoring.`);
                this._driftReport.warnings.push({ type: 'ROGUE_REDIS_CLIENT', file: rogueFile });
            }
        }
    }

    static getDriftReport() { return this._driftReport; }

    static _writeDriftReportToDisk() {
        try {
            const outPath = path.join(process.cwd(), 'logs', 'architecture_drift_report.json');
            const dir = path.dirname(outPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(outPath, JSON.stringify(this._driftReport, null, 2), 'utf8');
        } catch (err) {
            logger.warn(`[ARCH-LOCK] Could not write drift report: ${err.message}`);
        }
    }
}

module.exports = ArchitectureLockService;
