import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seeders = [
  // ── Question Pool Seeders ──────────────────────────────────────────
  'seedAll.js',
  'seedQuestions_SSC_CHSL.js',
  'seedQuestionsLargePools.js',
  'seedSubtopicNormalization.js',

  // ── Learning Content Expansion ────────────────────────────────────
  // NOTE: generateExpandedContent.js rewrites syllabus JSON + clears
  // learningcontents collection before inserting 20,328 premium records.
  // It must run AFTER all question seeders so the mapper can find source Qs.
  'generateExpandedContent.js',
  'seedSubtopicMapper.js'
];

console.log('======================================================');
console.log('  NirnayPath 3.0 — Master Database Seeding Runner');
console.log('======================================================');

for (const script of seeders) {
  const scriptPath = path.join(__dirname, script);
  console.log(`\n🚀 Executing: ${script}...`);
  try {
    const output = execSync(`node "${scriptPath}"`, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(output);
    console.log(`✅ Completed: ${script}`);
  } catch (err) {
    console.error(`❌ Error executing ${script}:`, err.message);
    if (err.stdout) console.log('Stdout:', err.stdout);
    if (err.stderr) console.error('Stderr:', err.stderr);
    process.exit(1);
  }
}

console.log('\n======================================================');
console.log('  🎉 ALL SEEDERS EXECUTED SUCCESSFULLY!');
console.log('  Database is fully populated and verified.');
console.log('======================================================\n');
