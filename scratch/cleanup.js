const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// 1. Directories to completely delete
const dirsToDelete = [
    'bootstrap',
    'internal',
    'workers'
];

// 2. Specific models to delete
const modelsToDelete = [
    'BlogPost.js',
    'CommunityDiscussion.js',
    'Coupon.js',
    'DailyChallenge.js',
    'GoalTracker.js',
    'Institution.js',
    'Notification.js',
    'PeerBattle.js',
    'QuestionTelemetry.js',
    'Referral.js',
    'StudyGroup.js',
    'SupportTicket.js',
    'UserActivityLog.js',
    'UserXP.js',
    'Wallet.js',
    'chatMessage.js',
    'liveResult.js',
    'liveSession.js',
    'payment.js',
    'testViolation.js'
];

// 3. Services to keep (any other service in /services will be deleted)
const servicesToKeep = new Set([
    'cacheLayer.js',
    'questionRepository.js',
    'selectionEngine.js',
    'dedupEngine.js',
    'performanceAnalyticsService.js',
    'questionService.js'
]);

// 4. Utilities to keep (any other utility in /utils will be deleted)
const utilsToKeep = new Set([
    'logger.js',
    'fileUtils.js',
    'questionFingerprint.js',
    'questionLoader.js',
    'questionNormalizer.js',
    'questionSelectionService.js',
    'sanitizeQuestions.js',
    'topicNormalizer.js'
]);

// 5. Config files to delete
const configsToDelete = [
    'featureFlags.js',
    'plans.js',
    'sections.js'
];

// 6. Root scripts / files to delete
const rootFilesToDelete = [
    'create_admin_temp.js',
    'extract.js',
    'generate_cs_final.js',
    'integration_test.js',
    'promoteAdmin.js',
    'test_ui.js',
    'upgrade-css.js',
    'upgrade-js.js',
    'verify_e2e_runtime.js',
    'verify_telemetry.js',
    'AUTH_FORENSIC_REPORT.md',
    'BUG_REVIEW_SUMMARY.md',
    'CRITICAL_BLOCKER_FORENSIC_REPORT.md',
    'DATA_FLOW_GRAPH.md',
    'DEPENDENCY_GRAPH.md',
    'DEPLOYMENT_SUCCESS_REPORT.md',
    'FINAL_RELEASE_CERTIFICATION.md',
    'FINAL_SRE_CERTIFICATION.md',
    'FORENSIC_MASTER_AUDIT.md',
    'PRE_DEPLOYMENT_BLOCKERS.md',
    'PRODUCTION_DEPLOYMENT_CHECKLIST.md',
    'RISK_MATRIX.md',
    'SAFE_DELETION_REPORT.md',
    'SRE_FINAL_REPORT.md',
    'SYSTEM_INTELLIGENCE_MAP.md',
    'SYSTEM_STABLE_v1.md',
    'audit_report.json',
    'e2e_results.json',
    'e2e_runner.js'
];

// 7. Route files to keep (all others will be deleted)
const routesToKeep = new Set([
    'pages.js',
    'auth.js',
    'test.js',
    'admin.js',
    'learning.js'
]);

// 8. Public js files to keep (all others will be deleted)
const publicJsToKeep = new Set([
    'app.js',
    'auth.js',
    'learn.js',
    'mock-tests.js',
    'dashboard.js',
    'admin.js'
]);

// 9. Public HTML files to keep (all others will be deleted)
const publicHtmlToKeep = new Set([
    'index.html',
    'about.html',
    'learn.html',
    'mock-tests.html',
    'dashboard.html',
    'admin.html'
]);

function deletePathRecursive(targetPath) {
    if (!fs.existsSync(targetPath)) return;
    const stats = fs.statSync(targetPath);
    if (stats.isDirectory()) {
        fs.readdirSync(targetPath).forEach(file => {
            deletePathRecursive(path.join(targetPath, file));
        });
        fs.rmdirSync(targetPath);
        console.log(`[DELETED DIR] ${targetPath}`);
    } else {
        fs.unlinkSync(targetPath);
        console.log(`[DELETED FILE] ${targetPath}`);
    }
}

// Execute directories deletion
dirsToDelete.forEach(dir => {
    deletePathRecursive(path.join(ROOT, dir));
});

// Execute specific models deletion
modelsToDelete.forEach(model => {
    const p = path.join(ROOT, 'models', model);
    if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log(`[DELETED MODEL] ${model}`);
    }
});

// Clean up Services directory
const servicesDir = path.join(ROOT, 'services');
if (fs.existsSync(servicesDir)) {
    fs.readdirSync(servicesDir).forEach(file => {
        if (!servicesToKeep.has(file)) {
            fs.unlinkSync(path.join(servicesDir, file));
            console.log(`[DELETED SERVICE] ${file}`);
        }
    });
}

// Clean up Utils directory
const utilsDir = path.join(ROOT, 'utils');
if (fs.existsSync(utilsDir)) {
    fs.readdirSync(utilsDir).forEach(file => {
        if (!utilsToKeep.has(file)) {
            fs.unlinkSync(path.join(utilsDir, file));
            console.log(`[DELETED UTILITY] ${file}`);
        }
    });
}

// Clean up Config directory files
configsToDelete.forEach(conf => {
    const p = path.join(ROOT, 'config', conf);
    if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log(`[DELETED CONFIG] ${conf}`);
    }
});

// Clean up Root files
rootFilesToDelete.forEach(file => {
    const p = path.join(ROOT, file);
    if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log(`[DELETED ROOT FILE] ${file}`);
    }
});

// Clean up Routes directory
const routesDir = path.join(ROOT, 'routes');
if (fs.existsSync(routesDir)) {
    fs.readdirSync(routesDir).forEach(file => {
        if (!routesToKeep.has(file)) {
            fs.unlinkSync(path.join(routesDir, file));
            console.log(`[DELETED ROUTE] ${file}`);
        }
    });
}

// Clean up Public/js directory
const publicJsDir = path.join(ROOT, 'public/js');
if (fs.existsSync(publicJsDir)) {
    fs.readdirSync(publicJsDir).forEach(file => {
        if (!publicJsToKeep.has(file)) {
            fs.unlinkSync(path.join(publicJsDir, file));
            console.log(`[DELETED PUBLIC JS] ${file}`);
        }
    });
}

// Clean up Public HTML files
const publicDir = path.join(ROOT, 'public');
if (fs.existsSync(publicDir)) {
    fs.readdirSync(publicDir).forEach(file => {
        if (file.endsWith('.html') && !publicHtmlToKeep.has(file)) {
            fs.unlinkSync(path.join(publicDir, file));
            console.log(`[DELETED PUBLIC HTML] ${file}`);
        }
    });
}

console.log('Cleanup Script completed successfully!');
