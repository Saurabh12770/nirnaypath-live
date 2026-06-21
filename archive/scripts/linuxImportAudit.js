/**
 * NirnayPath Production Hardening Script
 * Phase 4: Linux Import Audit
 * 
 * Verifies that all imports physically exist on the filesystem with EXACT casing.
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const SCAN_DIRS = ['services', 'routes', 'middleware', 'core', 'utils', 'models', 'scripts', 'workers'];

let failureCount = 0;

function auditFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const sourceRelative = path.relative(BASE_DIR, filePath);
    
    // Support both require and ES modules
    const importRegex = /(?:require\(|from\s+|import\s+)['"](\..*?)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        const sourceDir = path.dirname(filePath);
        
        // Resolve target path
        let targetPath = path.resolve(sourceDir, importPath);
        
        // Check for .js extension if missing
        if (!targetPath.endsWith('.js') && !fs.existsSync(targetPath) && fs.existsSync(targetPath + '.js')) {
            targetPath += '.js';
        }

        if (!fs.existsSync(targetPath)) {
            console.error(`[CRITICAL] Broken Import: "${importPath}" in ${sourceRelative}`);
            console.error(`           Resolved to: ${targetPath} (NOT FOUND)`);
            failureCount++;
            continue;
        }

        // VERIFY CASING (Linux Compatibility)
        const targetDir = path.dirname(targetPath);
        const expectedFileName = path.basename(targetPath);
        const actualFiles = fs.readdirSync(targetDir);
        
        if (!actualFiles.includes(expectedFileName)) {
            const actualMatch = actualFiles.find(f => f.toLowerCase() === expectedFileName.toLowerCase());
            console.error(`[CRITICAL] Case Mismatch: "${importPath}" in ${sourceRelative}`);
            console.error(`           Expected: ${expectedFileName}`);
            console.error(`           Actual:   ${actualMatch || 'NOT FOUND'}`);
            failureCount++;
        }
    }
}

function scanDir(dir) {
    const fullPath = path.join(BASE_DIR, dir);
    if (!fs.existsSync(fullPath)) return;

    const entries = fs.readdirSync(fullPath);
    entries.forEach(entry => {
        const entryPath = path.join(fullPath, entry);
        if (fs.statSync(entryPath).isDirectory()) {
            if (entry !== 'node_modules' && entry !== '.git') {
                scanDir(path.join(dir, entry));
            }
        } else if (entry.endsWith('.js')) {
            if (entry === 'stabilizeArchitecture.js' || entry === 'forensicAudit.js') return;
            auditFile(entryPath);
        }
    });
}

console.log('--- NirnayPath Linux Import Audit ---');
SCAN_DIRS.forEach(scanDir);
auditFile(path.join(BASE_DIR, 'app.js'));

if (failureCount > 0) {
    console.error(`\n[FAILURE] Detected ${failureCount} import errors. Build rejected.`);
    process.exit(1);
} else {
    console.log('\n[SUCCESS] All imports verified for Linux case-sensitivity.');
    process.exit(0);
}
