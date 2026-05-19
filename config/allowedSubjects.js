/**
 * allowedSubjects.js
 * ==================
 * SECURITY: Centralized whitelist of every valid subject slug.
 * This is the ONLY source of truth for path traversal prevention in
 * questionRepository.js. Any new subject data file MUST be added here.
 *
 * Rules:
 *  - All entries must be lowercase
 *  - No path separators, dots, or spaces
 *  - Must exactly match the filename stem in /data/*.json
 */

const ALLOWED_SUBJECTS = new Set([
  // Section: Quantitative Aptitude
  'math',
  'aptitude',

  // Section: General Studies
  'history',
  'geography',
  'polity',
  'economics',
  'science',
  'general-studies',

  // Section: Reasoning
  'reasoning',

  // Section: English Language
  'english',

  // Section: Current Affairs
  'current',
  'current-affairs',

  // Section: State Special
  'bpsc-special',
  'bihar-gk',

  // Standalone subjects
  'computerscience',
  'computer-science',
  'hindi',
  'environment',
  'physics',
  'chemistry',
  'biology',
  'gk',
  'ssc',
  'railway',
  'upsc',
  'banking',
  'mathematics',
]);

/**
 * Validates a raw subject string against the whitelist.
 * Returns the sanitized slug if valid, or null if blocked.
 *
 * @param {string} rawSubject - User-supplied subject string
 * @returns {{ slug: string } | null}
 */
function validateSubject(rawSubject) {
  if (typeof rawSubject !== 'string') return null;

  // 1. Sanitize: lowercase + trim
  let slug = rawSubject.toLowerCase().trim();

  // 2. path.basename() strips any directory components
  const path = require('path');
  slug = path.basename(slug);

  // 3. Reject any file extension — only bare slug names are valid.
  //    We do NOT strip extensions here; the slug must be extension-free.
  if (/\.[^.]+$/.test(slug)) {
    return null; // e.g. math.js, math.json, math.php — all rejected
  }
  // 4. Strict character regex: only [a-z0-9-] allowed (no dots, slashes, percent encoding)
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return null;
  }

  // 5. Explicit path traversal patterns — belt & suspenders
  const TRAVERSAL_PATTERNS = [
    '..',
    './',
    '/',
    '\\',
    '%2e',
    '%2f',
    '%5c',
    '%00',
  ];
  for (const pat of TRAVERSAL_PATTERNS) {
    if (slug.includes(pat)) return null;
  }

  // 6. Whitelist check
  if (!ALLOWED_SUBJECTS.has(slug)) {
    return null;
  }

  return { slug };
}

/**
 * Validates an array of subjects, returning only the valid slugs.
 * Throws if ALL subjects are invalid (nothing to serve).
 *
 * @param {string[]} subjects
 * @returns {string[]}
 */
function validateSubjects(subjects) {
  if (!Array.isArray(subjects)) {
    const result = validateSubject(subjects);
    if (!result) return [];
    return [result.slug];
  }
  return subjects
    .map(s => validateSubject(s))
    .filter(Boolean)
    .map(r => r.slug);
}

module.exports = { ALLOWED_SUBJECTS, validateSubject, validateSubjects };
