const fs = require('fs');
const path = require('path');
const base = 'c:/Users/SAURABH KUMAR/Desktop/NirnayPath';

// Archive root app.js → archive/app.legacy.js (legacy CJS entry, superseded by backend/app.js ESM)
const rootApp = path.join(base, 'app.js');
const archiveDir = path.join(base, 'archive');
fs.mkdirSync(archiveDir, { recursive: true });

if (fs.existsSync(rootApp)) {
  fs.renameSync(rootApp, path.join(archiveDir, 'app.legacy.js'));
  console.log('Archived root app.js → archive/app.legacy.js');
} else {
  console.log('root app.js already gone');
}

// Check ecosystem.config.js for references to root app.js
const eco = path.join(base, 'ecosystem.config.js');
if (fs.existsSync(eco)) {
  const c = fs.readFileSync(eco, 'utf8');
  const refersToRootApp = c.includes('./app.js') || c.includes('"app.js"') || c.includes("'app.js'");
  if (refersToRootApp) {
    console.log('WARNING: ecosystem.config.js references root app.js — needs manual update!');
    c.split('\n').forEach((l, i) => { if (l.toLowerCase().includes('app')) console.log('  L' + (i+1) + ': ' + l); });
  } else {
    console.log('ecosystem.config.js does NOT reference root app.js — safe to archive.');
  }
}

// Delete thin/useless question files: social_science.json (4 qs), chemistry.json (6 qs)
// These trigger emergency fallback on every use and have no real value
const thinFiles = ['social_science.json', 'chemistry.json'];
thinFiles.forEach(f => {
  const fp = path.join(base, 'data/questions', f);
  const archPath = path.join(archiveDir, f);
  if (fs.existsSync(fp)) {
    fs.renameSync(fp, archPath);
    console.log('Archived thin file: data/questions/' + f + ' → archive/' + f);
  }
});

// Keep law.json (11 qs) and police_science.json (20 qs) — they serve a niche purpose
// but flag them in a comment
console.log('\nKept (niche use):');
console.log('  data/questions/law.json (11 qs) — kept, serves State PCS law topics');
console.log('  data/questions/police_science.json (20 qs) — kept, serves Police exam fallback');

console.log('\nDone.');
