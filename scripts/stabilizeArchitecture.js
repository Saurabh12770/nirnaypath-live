const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_DIR = path.resolve(__dirname, '..');

const RENAMES = {
    'services/CacheLayer.js': 'services/cacheLayer.js',
    'services/DedupEngine.js': 'services/dedupEngine.js',
    'services/HistoryService.js': 'services/historyService.js',
    'services/QuestionRuntimeEngine.js': 'services/questionRuntimeEngine.js',
    'services/QuestionService.js': 'services/questionService.js',
    'services/SelectionEngine.js': 'services/selectionEngine.js',
    'models/ChatMessage.js': 'models/chatMessage.js',
    'models/LiveResult.js': 'models/liveResult.js',
    'models/LiveSession.js': 'models/liveSession.js',
    'models/Payment.js': 'models/payment.js',
    'models/Question.js': 'models/question.js',
    'models/TestResult.js': 'models/testResult.js',
    'models/TestSession.js': 'models/testSession.js',
    'models/User.js': 'models/user.js',
    'scripts/audit_questions.js': 'scripts/auditQuestions.js',
    'scripts/fix_questions.js': 'scripts/fixQuestions.js',
    'scripts/generate_questions.js': 'scripts/generateQuestions.js',
    'scripts/validate_questions.js': 'scripts/validateQuestions.js'
};

// Also handle the files that are ALREADY lowercase on disk but referred to as PascalCase in code
const IMPORT_FIXES = {
    ...RENAMES,
    'services/QuestionRepository.js': 'services/questionRepository.js'
};

function safeRename() {
    console.log('--- Phase 2: File Normalization ---');
    for (const [oldPath, newPath] of Object.entries(RENAMES)) {
        const fullOldPath = path.join(BASE_DIR, oldPath);
        const fullNewPath = path.join(BASE_DIR, newPath);

        if (fs.existsSync(fullOldPath)) {
            console.log(`Renaming ${oldPath} -> ${newPath}`);
            try {
                // Windows is case-insensitive, so git mv A a might not work directly.
                // Use temp file strategy.
                const tempPath = fullOldPath + '.tmp';
                execSync(`git mv "${oldPath}" "${oldPath}.tmp"`, { cwd: BASE_DIR });
                execSync(`git mv "${oldPath}.tmp" "${newPath}"`, { cwd: BASE_DIR });
            } catch (err) {
                console.error(`Error renaming ${oldPath}: ${err.message}`);
                // Fallback to manual rename if git fails
                if (fs.existsSync(fullOldPath)) {
                    fs.renameSync(fullOldPath, fullNewPath);
                }
            }
        } else {
            console.warn(`File ${oldPath} not found, skipping rename.`);
        }
    }
}

function updateImports() {
    console.log('\n--- Phase 3: Import Reconstruction ---');
    const directories = ['services', 'routes', 'middleware', 'core', 'utils', 'models', 'scripts', 'workers', '.'];
    
    // Create mapping for search and replace
    // We want to match require('./services/questionService') and change to require('./services/questionService')
    const mappings = Object.entries(IMPORT_FIXES).map(([oldFile, newFile]) => {
        const oldBase = path.basename(oldFile, '.js');
        const newBase = path.basename(newFile, '.js');
        return { oldBase, newBase };
    });

    function processDir(dir) {
        const fullDirPath = path.join(BASE_DIR, dir);
        if (!fs.existsSync(fullDirPath)) return;

        const entries = fs.readdirSync(fullDirPath);
        entries.forEach(entry => {
            const fullPath = path.join(fullDirPath, entry);
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                if (entry !== 'node_modules' && entry !== '.git') {
                    processDir(path.join(dir, entry));
                }
            } else if (entry.endsWith('.js')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let modified = false;

                mappings.forEach(({ oldBase, newBase }) => {
                    // Match require/import with any path prefix
                    // regex: (require\(|from\s+)['"]([^'"]*?\/)?OLD_BASE(['"]\)?)
                    const regex = new RegExp(`(require\\(['"]|from\\s+['"]|import\\s+['"])([^'"]*?\\/)?${oldBase}(['"]\\)?)`, 'g');
                    if (regex.test(content)) {
                        console.log(`Updating import in ${path.join(dir, entry)}: ${oldBase} -> ${newBase}`);
                        content = content.replace(regex, `$1$2${newBase}$3`);
                        modified = true;
                    }
                });

                if (modified) {
                    fs.writeFileSync(fullPath, content);
                }
            }
        });
    }

    directories.forEach(dir => processDir(dir));
}

try {
    safeRename();
    updateImports();
    console.log('\nStabilization complete!');
} catch (err) {
    console.error('Stabilization failed:', err);
    process.exit(1);
}
