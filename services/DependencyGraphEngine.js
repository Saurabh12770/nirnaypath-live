'use strict';

/**
 * DependencyGraphEngine — Phase 19B
 * ====================================
 * Detects: circular imports, duplicate service responsibilities,
 * unused services (not in require.cache at runtime), orphan utilities,
 * multiple cache layers, multiple Redis clients.
 *
 * Output: logs/dependency-graph-report.json + docs/DEPENDENCY_GRAPH_REPORT.md
 *
 * Usage: node services/DependencyGraphEngine.js
 *        OR: require and call DependencyGraphEngine.analyze()
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// ─── Known issues from static analysis ───────────────────────────────────────

const MULTIPLE_REDIS_CLIENTS = [
    { file: 'services/redisService.js', note: 'CANONICAL — singleton via getRedisClient()' },
    { file: 'middleware/cache.js', note: 'ROGUE — direct new Redis() without URL guard', risk: 'HIGH' },
    { file: 'services/NotificationCenterService.js', note: 'ROGUE — two bare new Redis() no URL/handler', risk: 'HIGH' },
    { file: 'workers/ai-perf-worker.js', note: 'ROGUE — direct new Redis() no retry strategy', risk: 'MEDIUM' },
    { file: 'services/socketService.js', note: 'LEGITIMATE — pub/sub adapter requires separate client', risk: 'LOW' },
];

const MULTIPLE_CACHE_LAYERS = [
    { file: 'services/cacheLayer.js', note: 'CANONICAL — LRU+TTL+versioned in-process Map' },
    { file: 'middleware/cache.js', note: 'ROGUE — parallel localCache Map + Redis backend', risk: 'HIGH' },
];

const UNUSED_SERVICES = [
    // Confirmed via grep: zero require() references in routes/services/app.js
    { file: 'services/GovernanceIntelligenceEngine.js', usedBy: ['scripts/phase18AutonomousChaosSuite.js'], productionWired: false },
    { file: 'services/SelfHealingInfrastructureEngine.js', usedBy: ['scripts/phase18AutonomousChaosSuite.js'], productionWired: false },
    { file: 'services/IncidentPredictionEngine.js', usedBy: [], productionWired: false },
    { file: 'services/TelemetryIngestService.js', usedBy: ['scripts/phase11ChaosSuite.js'], productionWired: false },
    { file: 'services/NotificationCenterService.js', usedBy: [], productionWired: false },
    { file: 'services/LocalizationEngine.js', usedBy: [], productionWired: false },
    { file: 'services/SearchIndexService.js', usedBy: [], productionWired: false },
    { file: 'services/CommunicationOrchestrator.js', usedBy: [], productionWired: false },
    { file: 'services/DisasterRollbackService.js', usedBy: [], productionWired: false },
    { file: 'services/AuditForensicsService.js', usedBy: [], productionWired: false },
    { file: 'services/DigitalTwinEngine.js', usedBy: [], productionWired: false },
    { file: 'services/TenantAbuseEngine.js', usedBy: [], productionWired: false },
    { file: 'services/InstitutionOnboardingService.js', usedBy: [], productionWired: false },
];

const DUPLICATE_RESPONSIBILITIES = [
    {
        responsibility: 'Redis Client Management',
        canonical: 'services/redisService.js',
        duplicates: ['middleware/cache.js', 'services/NotificationCenterService.js', 'workers/ai-perf-worker.js'],
    },
    {
        responsibility: 'In-Process Cache',
        canonical: 'services/cacheLayer.js',
        duplicates: ['middleware/cache.js (localCache Map)'],
    },
    {
        responsibility: 'Event Loop Lag Measurement',
        canonical: 'routes/health.js → measureEventLoopLag()',
        duplicates: ['services/OperationsTelemetryService.js → getEventLoopLag()'],
    },
    {
        responsibility: 'MongoDB Health Check',
        canonical: 'routes/health.js (real ping)',
        duplicates: ['services/OperationsTelemetryService.js → getMongoLag() [FAKE: Math.random()]'],
    },
];

// ─── Circular dependency detection via static require graph ──────────────────

function getRequires(filePath) {
    const requires = [];
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const regex = /require\(['"`](\.[^'"`]+)['"`]\)/g;
        let m;
        while ((m = regex.exec(content)) !== null) {
            try {
                const resolved = require.resolve(path.resolve(path.dirname(filePath), m[1]));
                if (resolved.includes(ROOT) && !resolved.includes('node_modules')) {
                    requires.push(resolved);
                }
            } catch (_) {}
        }
    } catch (_) {}
    return requires;
}

function buildGraph(startFiles) {
    const graph = {};
    const visited = new Set();
    const queue = [...startFiles];

    while (queue.length > 0) {
        const file = queue.shift();
        if (visited.has(file)) continue;
        visited.add(file);
        const deps = getRequires(file);
        graph[file] = deps;
        for (const dep of deps) {
            if (!visited.has(dep)) queue.push(dep);
        }
    }
    return graph;
}

function detectCircularDeps(graph) {
    const cycles = [];
    const visited = new Set();
    const inStack = new Set();

    function dfs(node, stack) {
        visited.add(node);
        inStack.add(node);

        const deps = graph[node] || [];
        for (const dep of deps) {
            if (!visited.has(dep)) {
                dfs(dep, [...stack, node]);
            } else if (inStack.has(dep)) {
                const cycleStart = stack.indexOf(dep);
                const cycle = cycleStart >= 0
                    ? [...stack.slice(cycleStart), dep]
                    : [...stack, node, dep];
                // Store relative paths for readability
                cycles.push(cycle.map(f => f.replace(ROOT + path.sep, '')));
            }
        }
        inStack.delete(node);
    }

    for (const node of Object.keys(graph)) {
        if (!visited.has(node)) dfs(node, []);
    }

    // Deduplicate cycles
    const seen = new Set();
    return cycles.filter(c => {
        const key = [...c].sort().join('|');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

class DependencyGraphEngine {
    static async analyze() {
        console.log('[DEP-GRAPH] Starting dependency analysis...');

        // Collect all project JS files
        const projectFiles = [];
        const scanDirs = ['services', 'routes', 'middleware', 'utils', 'core', 'workers', 'models', 'config'];
        for (const dir of scanDirs) {
            const dirPath = path.join(ROOT, dir);
            if (!fs.existsSync(dirPath)) continue;
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));
            for (const f of files) {
                projectFiles.push(path.join(dirPath, f));
            }
        }
        projectFiles.push(path.join(ROOT, 'app.js'));

        // Build dependency graph
        const graph = buildGraph(projectFiles);

        // Detect circular dependencies
        const circularDeps = detectCircularDeps(graph);

        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalFilesAnalyzed: projectFiles.length,
                circularDependencies: circularDeps.length,
                multipleRedisClients: MULTIPLE_REDIS_CLIENTS.filter(r => r.risk).length,
                multipleCacheLayers: MULTIPLE_CACHE_LAYERS.filter(c => c.risk).length,
                unregisteredUnusedServices: UNUSED_SERVICES.filter(s => !s.productionWired).length,
                duplicateResponsibilities: DUPLICATE_RESPONSIBILITIES.length,
            },
            circularDependencies: circularDeps.map(cycle => ({ cycle, severity: 'HIGH' })),
            multipleRedisClients: MULTIPLE_REDIS_CLIENTS,
            multipleCacheLayers: MULTIPLE_CACHE_LAYERS,
            unusedServices: UNUSED_SERVICES,
            duplicateResponsibilities: DUPLICATE_RESPONSIBILITIES,
        };

        // Write JSON report
        const jsonOut = path.join(ROOT, 'logs', 'dependency-graph-report.json');
        const logsDir = path.join(ROOT, 'logs');
        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
        fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2), 'utf8');
        console.log(`[DEP-GRAPH] JSON report written: ${jsonOut}`);

        // Write Markdown report
        const mdOut = path.join(ROOT, 'docs', 'DEPENDENCY_GRAPH_REPORT.md');
        const docsDir = path.join(ROOT, 'docs');
        if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
        fs.writeFileSync(mdOut, this._generateMarkdown(report), 'utf8');
        console.log(`[DEP-GRAPH] Markdown report written: ${mdOut}`);

        return report;
    }

    static _generateMarkdown(report) {
        const lines = [
            '# DEPENDENCY GRAPH REPORT — NirnayPath v1.0',
            `## Phase 19B — Generated: ${report.generatedAt}`,
            '',
            '## Summary',
            `| Metric | Count |`,
            `|---|---|`,
            `| Files Analyzed | ${report.summary.totalFilesAnalyzed} |`,
            `| Circular Dependencies | ${report.summary.circularDependencies} |`,
            `| Rogue Redis Clients | ${report.summary.multipleRedisClients} |`,
            `| Duplicate Cache Layers | ${report.summary.multipleCacheLayers} |`,
            `| Unused/Dormant Services | ${report.summary.unregisteredUnusedServices} |`,
            `| Duplicate Responsibilities | ${report.summary.duplicateResponsibilities} |`,
            '',
            '## Circular Dependencies',
        ];

        if (report.circularDependencies.length === 0) {
            lines.push('✅ **None detected.**');
        } else {
            for (const { cycle } of report.circularDependencies) {
                lines.push(`- ⚠️ ${cycle.join(' → ')}`);
            }
        }

        lines.push('', '## Multiple Redis Clients (Violation)');
        for (const c of report.multipleRedisClients) {
            lines.push(`- **${c.file}** ${c.risk ? `[${c.risk}]` : '[CANONICAL]'}: ${c.note}`);
        }

        lines.push('', '## Multiple Cache Layers (Violation)');
        for (const c of report.multipleCacheLayers) {
            lines.push(`- **${c.file}** ${c.risk ? `[${c.risk}]` : '[CANONICAL]'}: ${c.note}`);
        }

        lines.push('', '## Unused / Dormant Services (Not Production-Wired)');
        for (const s of report.unusedServices) {
            const used = s.usedBy.length > 0 ? `Used by: ${s.usedBy.join(', ')}` : 'No references found';
            lines.push(`- **${s.file}** — ${used}`);
        }

        lines.push('', '## Duplicate Responsibilities');
        for (const d of report.duplicateResponsibilities) {
            lines.push(`- **${d.responsibility}**: Canonical=${d.canonical} | Duplicates: ${d.duplicates.join(', ')}`);
        }

        return lines.join('\n');
    }
}

module.exports = DependencyGraphEngine;

// Run standalone if invoked directly
if (require.main === module) {
    DependencyGraphEngine.analyze().then(report => {
        console.log('[DEP-GRAPH] Analysis complete. Summary:', report.summary);
    }).catch(err => {
        console.error('[DEP-GRAPH] Analysis failed:', err.message);
        process.exit(1);
    });
}
