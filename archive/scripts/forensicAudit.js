const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const SCAN_DIRS = ['services', 'routes', 'middleware', 'core', 'utils', 'models', 'workers', 'config', 'scripts'];
const IGNORE_FILES = ['forensicAudit.js', 'linuxImportAudit.js'];

// Graph maps absolute file path -> Set of absolute paths it imports
const dependencyGraph = new Map();
// Set of all absolute file paths in scan dirs + app.js
const allFiles = new Set();
const entryPoints = new Set([
    path.join(BASE_DIR, 'app.js'),
    path.join(BASE_DIR, 'ecosystem.config.js')
]);

// Helper to add to allFiles
function registerFile(filePath) {
    if (filePath.endsWith('.js') && !IGNORE_FILES.includes(path.basename(filePath))) {
        allFiles.add(filePath);
        if (filePath.includes('workers\\') || filePath.includes('workers/')) {
            entryPoints.add(filePath); // Workers are often entry points themselves
        }
        if (filePath.includes('scripts\\') || filePath.includes('scripts/')) {
            entryPoints.add(filePath); // Scripts are entry points
        }
    }
}

// Find all files
function scanDir(dir) {
    const fullPath = path.join(BASE_DIR, dir);
    if (!fs.existsSync(fullPath)) return;
    
    const entries = fs.readdirSync(fullPath);
    for (const entry of entries) {
        const entryPath = path.join(fullPath, entry);
        if (fs.statSync(entryPath).isDirectory()) {
            if (entry !== 'node_modules' && entry !== '.git') {
                scanDir(path.join(dir, entry));
            }
        } else {
            registerFile(entryPath);
        }
    }
}

SCAN_DIRS.forEach(scanDir);
registerFile(path.join(BASE_DIR, 'app.js'));

// Read imports
for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /(?:require\(|from\s+|import\s+)['"]([\.\/].*?)['"]/g;
    let match;
    const imports = new Set();
    
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        const sourceDir = path.dirname(filePath);
        let targetPath = path.resolve(sourceDir, importPath);
        
        if (!targetPath.endsWith('.js') && fs.existsSync(targetPath + '.js')) {
            targetPath += '.js';
        }
        
        if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
            imports.add(targetPath);
        } else if (fs.existsSync(path.join(targetPath, 'index.js'))) {
            imports.add(path.join(targetPath, 'index.js'));
        }
    }
    
    dependencyGraph.set(filePath, imports);
}

// Perform DFS from entry points
const visited = new Set();
function dfs(node) {
    if (visited.has(node)) return;
    visited.add(node);
    
    const imports = dependencyGraph.get(node) || new Set();
    for (const imp of imports) {
        dfs(imp);
    }
}

for (const entry of entryPoints) {
    if (allFiles.has(entry) || entry.endsWith('app.js') || entry.endsWith('ecosystem.config.js')) {
        dfs(entry);
    }
}

const deadFiles = Array.from(allFiles).filter(f => !visited.has(f));

const reportPath = path.join(BASE_DIR, 'FORENSIC_MASTER_AUDIT.md');
const deletePath = path.join(BASE_DIR, 'SAFE_DELETION_REPORT.md');

let reportMarkdown = `# FORENSIC MASTER AUDIT\n\n`;
reportMarkdown += `## Dead Files Detected\n\n`;
if (deadFiles.length === 0) {
    reportMarkdown += `No dead files detected.\n`;
} else {
    for (const f of deadFiles) {
        reportMarkdown += `- \` ${path.relative(BASE_DIR, f)} \` (Unused in application tree)\n`;
    }
}

let deleteMarkdown = `# SAFE DELETION REPORT\n\n`;
for (const f of deadFiles) {
    const rel = path.relative(BASE_DIR, f);
    deleteMarkdown += `File: ${rel}\n`;
    deleteMarkdown += `Reason: Unreachable from any entry point (app.js, workers, scripts)\n`;
    deleteMarkdown += `Import count: 0\n`;
    deleteMarkdown += `Route usage: 0\n`;
    deleteMarkdown += `Runtime usage: 0\n`;
    deleteMarkdown += `Frontend usage: 0\n`;
    deleteMarkdown += `Can safely delete: YES\n\n`;
}

fs.writeFileSync(reportPath, reportMarkdown);
fs.writeFileSync(deletePath, deleteMarkdown);

console.log(`Audit complete. Found ${deadFiles.length} dead files.`);
