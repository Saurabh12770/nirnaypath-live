const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
    'services',
    'routes',
    'middleware',
    'core',
    'utils',
    'models',
    'scripts',
    'workers'
];

const BASE_DIR = path.resolve(__dirname, '..');
const LOG_FILE = path.join(BASE_DIR, 'logs', 'import_casing_audit.json');

const results = {
    timestamp: new Date().toISOString(),
    casingIssues: [],
    brokenImports: [],
    allFiles: []
};

function isCamelCase(str) {
    if (str.endsWith('.js')) {
        str = str.slice(0, -3);
    }
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

function scanFiles(dir) {
    const fullPath = path.join(BASE_DIR, dir);
    if (!fs.existsSync(fullPath)) return;

    const files = fs.readdirSync(fullPath);
    files.forEach(file => {
        const filePath = path.join(fullPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            scanFiles(path.join(dir, file));
        } else if (file.endsWith('.js')) {
            const relativePath = path.join(dir, file).replace(/\\/g, '/');
            results.allFiles.push(relativePath);

            if (!isCamelCase(file)) {
                results.casingIssues.push({
                    file: relativePath,
                    reason: 'Not camelCase'
                });
            }

            checkImports(filePath, relativePath);
        }
    });
}

function checkImports(filePath, relativeFilePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const requireRegex = /require\(['"](.+?)['"]\)/g;
    const importRegex = /from ['"](.+?)['"]/g;

    let match;
    while ((match = requireRegex.exec(content)) !== null) {
        validateImport(match[1], relativeFilePath);
    }
    while ((match = importRegex.exec(content)) !== null) {
        validateImport(match[1], relativeFilePath);
    }
}

function validateImport(importPath, sourceFile) {
    if (!importPath.startsWith('.')) return; // Skip node_modules

    const sourceDir = path.dirname(path.join(BASE_DIR, sourceFile));
    let resolvedPath = path.resolve(sourceDir, importPath);
    
    if (!resolvedPath.endsWith('.js') && !fs.existsSync(resolvedPath) && fs.existsSync(resolvedPath + '.js')) {
        resolvedPath += '.js';
    }

    if (fs.existsSync(resolvedPath)) {
        const actualFile = findActualFileWithCasing(resolvedPath);
        const expectedFile = path.basename(resolvedPath);
        const actualFileName = path.basename(actualFile);

        if (expectedFile !== actualFileName) {
            results.brokenImports.push({
                source: sourceFile,
                import: importPath,
                expected: expectedFile,
                actual: actualFileName,
                reason: 'Casing mismatch'
            });
        }
    } else {
        results.brokenImports.push({
            source: sourceFile,
            import: importPath,
            reason: 'File not found'
        });
    }
}

function findActualFileWithCasing(filePath) {
    const dir = path.dirname(filePath);
    const fileName = path.basename(filePath).toLowerCase();
    if (!fs.existsSync(dir)) return filePath;
    const files = fs.readdirSync(dir);
    const match = files.find(f => f.toLowerCase() === fileName);
    return match ? path.join(dir, match) : filePath;
}

if (!fs.existsSync(path.join(BASE_DIR, 'logs'))) {
    fs.mkdirSync(path.join(BASE_DIR, 'logs'));
}

DIRECTORIES.forEach(scanFiles);

fs.writeFileSync(LOG_FILE, JSON.stringify(results, null, 2));
console.log(`Audit complete. Report saved to ${LOG_FILE}`);
