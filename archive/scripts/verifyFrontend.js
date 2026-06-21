const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '..', 'public');
const report = {
    timestamp: new Date().toISOString(),
    missingFiles: [],
    checkedFiles: []
};

function checkHtml(file) {
    const content = fs.readFileSync(path.join(publicDir, file), 'utf8');
    const assetRegex = /(?:href|src)=['"](.+?)['"]/g;
    let match;
    while ((match = assetRegex.exec(content)) !== null) {
        const assetPath = match[1];
        if (assetPath.startsWith('http') || assetPath.startsWith('//') || assetPath.startsWith('data:')) continue;
        
        let fullAssetPath;
        if (assetPath.startsWith('/')) {
            fullAssetPath = path.join(publicDir, assetPath);
        } else {
            fullAssetPath = path.join(publicDir, path.dirname(file), assetPath);
        }

        // Remove query params or hashes
        fullAssetPath = fullAssetPath.split('?')[0].split('#')[0];

        if (!fs.existsSync(fullAssetPath)) {
            report.missingFiles.push({ source: file, asset: assetPath, resolved: fullAssetPath });
        }
    }
}

const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
htmlFiles.forEach(f => {
    report.checkedFiles.push(f);
    checkHtml(f);
});

fs.writeFileSync(path.join(__dirname, '..', 'logs', 'frontend_verification.json'), JSON.stringify(report, null, 2));
console.log(`Frontend verification complete. Missing assets: ${report.missingFiles.length}`);
