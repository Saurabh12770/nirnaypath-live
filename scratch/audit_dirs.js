const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');

// Directories to ignore in comparison
const ignoreDirs = new Set(['.git', 'node_modules', 'scratch', 'backups', 'artifacts', 'logs', 'server', 'generated']);

function getFiles(dir, relativeTo = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!ignoreDirs.has(file)) {
        results = results.concat(getFiles(filePath, relativeTo));
      }
    } else {
      results.push(path.relative(relativeTo, filePath));
    }
  });
  return results;
}

function getMd5(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

const rootFiles = new Set(getFiles(rootDir));
const serverFiles = new Set(getFiles(serverDir));

console.log(`Total files in root (excluding ignored): ${rootFiles.size}`);
console.log(`Total files in server (excluding ignored): ${serverFiles.size}`);

const report = {
  onlyInRoot: [],
  onlyInServer: [],
  mismatches: [],
  matches: []
};

// Find files only in root or mismatches
for (const file of rootFiles) {
  const rootPath = path.join(rootDir, file);
  const serverPath = path.join(serverDir, file);

  if (!serverFiles.has(file)) {
    report.onlyInRoot.push(file);
  } else {
    // Both have it, compare md5
    const rootMd5 = getMd5(rootPath);
    const serverMd5 = getMd5(serverPath);
    if (rootMd5 !== serverMd5) {
      report.mismatches.push({
        file,
        rootSize: fs.statSync(rootPath).size,
        serverSize: fs.statSync(serverPath).size
      });
    } else {
      report.matches.push(file);
    }
  }
}

// Find files only in server
for (const file of serverFiles) {
  if (!rootFiles.has(file)) {
    report.onlyInServer.push(file);
  }
}

console.log("\n=== COMPLETED AUDIT ===");
console.log(`Only in Root: ${report.onlyInRoot.length}`);
console.log(`Only in Server: ${report.onlyInServer.length}`);
console.log(`Mismatches: ${report.mismatches.length}`);
console.log(`Matches: ${report.matches.length}`);

// Write JSON report
fs.writeFileSync(path.join(rootDir, 'audit_report.json'), JSON.stringify(report, null, 2));
console.log("Written audit_report.json successfully.");
