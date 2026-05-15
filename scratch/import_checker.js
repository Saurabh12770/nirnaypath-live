const fs = require('fs');
const path = require('path');

const root = 'C:\\Users\\SAURABH KUMAR\\Desktop\\NirnayPath\\server';

function checkImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                checkImports(fullPath);
            }
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                const match = line.match(/require\(['"](.+?)['"]\)/);
                if (match) {
                    const importPath = match[1];
                    if (importPath.startsWith('.')) {
                        const resolvedPath = path.resolve(dir, importPath);
                        let exists = false;
                        const extensions = ['', '.js', '.json', '/index.js'];
                        for (const ext of extensions) {
                            if (fs.existsSync(resolvedPath + ext) && !fs.statSync(resolvedPath + ext).isDirectory()) {
                                exists = true;
                                break;
                            }
                            if (fs.existsSync(resolvedPath + ext) && fs.statSync(resolvedPath + ext).isDirectory()) {
                                if (fs.existsSync(path.join(resolvedPath + ext, 'index.js'))) {
                                    exists = true;
                                    break;
                                }
                            }
                        }
                        if (!exists) {
                            console.error(`[ERROR] Broken import in ${fullPath}:${index + 1} -> ${importPath} (Resolved: ${resolvedPath})`);
                        }
                    }
                }
                
                // Check destructuring
                const destructuringMatch = line.match(/const\s+\{(.+?)\}\s*=\s*require\(['"](.+?)['"]\)/);
                if (destructuringMatch) {
                    const symbols = destructuringMatch[1].split(',').map(s => s.trim().split(':')[0].trim());
                    const importPath = destructuringMatch[2];
                    if (importPath.startsWith('.')) {
                        const resolvedPath = path.resolve(dir, importPath);
                        try {
                            const mod = require(resolvedPath);
                            symbols.forEach(sym => {
                                if (sym && mod[sym] === undefined) {
                                    console.error(`[ERROR] Missing export in ${fullPath}:${index + 1} -> '${sym}' not found in ${importPath}`);
                                }
                            });
                        } catch (e) {
                            // Already handled by basic existence check or just ignore here
                        }
                    }
                }
            });
        }
    }
}

console.log('Starting Import Audit...');
checkImports(root);
console.log('Audit Completed.');
