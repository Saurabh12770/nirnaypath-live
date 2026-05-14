// Phase validation test suite — runs offline (no DB, no server)
'use strict';

// ── Stub mongoose so TestResult can load without a real DB ────────────────
const Module = require('module');
const path = require('path');
const _orig = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...rest) {
    if (request === 'mongoose') return path.join(__dirname, '_mongooseMock.js');
    return _orig.call(this, request, parent, ...rest);
};

const { normalizeQuestion, normalizeBank } = require('../utils/questionNormalizer');
const { selectQuestions, shuffleFair } = require('../utils/questionSelectionService');

let pass = 0, fail = 0;

function test(label, fn) {
    try { fn(); console.log('  PASS:', label); pass++; }
    catch (e) { console.log('  FAIL:', label, '->', e.message); fail++; }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion failed'); }

// ── Phase 2: normalizeQuestion ─────────────────────────────────────────────
console.log('\n[Phase 2] normalizeQuestion tests');

test('valid question passes through', () => {
    const q = normalizeQuestion({
        id: 'Q1', question_en: 'What?', question_hi: 'क्या?',
        options_en: ['A','B','C','D'], options_hi: ['अ','ब','स','द'],
        correctAnswer: 0, explanation_en: 'A is correct', explanation_hi: 'अ सही है'
    });
    assert(!q.isInvalid, 'should not be invalid');
    assert(q.options_en.length === 4, 'must have 4 options');
    assert(q.correctAnswer === 0, 'correctAnswer must be 0');
});

test('missing question text marks isInvalid', () => {
    const q = normalizeQuestion({ options_en: ['A','B','C','D'], correctAnswer: 0 });
    assert(q.isInvalid, 'should be invalid');
});

test('3-option question marks isInvalid', () => {
    const q = normalizeQuestion({ question_en: 'Q?', options_en: ['A','B','C'], correctAnswer: 0 });
    assert(q.isInvalid, 'should be invalid');
});

test('correctAnswer out of range marks isInvalid', () => {
    const q = normalizeQuestion({ question_en: 'Q?', options_en: ['A','B','C','D'], correctAnswer: 9 });
    assert(q.isInvalid, 'should be invalid');
});

test('letter correctAnswer B converted to index 1', () => {
    const q = normalizeQuestion({
        question_en: 'Q?', question_hi: 'क?',
        options_en: ['A','B','C','D'], options_hi: ['अ','ब','स','द'],
        correctAnswer: 'B', explanation_en: 'X', explanation_hi: 'Y'
    });
    assert(!q.isInvalid, 'should be valid');
    assert(q.correctAnswer === 1, 'B should map to index 1');
});

test('comma-separated options string repaired to array', () => {
    const q = normalizeQuestion({
        question_en: 'Q?', question_hi: 'क?',
        options_en: 'A,B,C,D', options_hi: ['अ','ब','स','द'],
        correctAnswer: 0, explanation_en: 'E', explanation_hi: 'H'
    });
    assert(!q.isInvalid, 'should be valid after repair');
    assert(q.options_en.length === 4, 'should have 4 options');
});

test('missing explanation filled with synthetic fallback', () => {
    const q = normalizeQuestion({
        id: 'X', question_en: 'Q?', question_hi: 'क?',
        options_en: ['A','B','C','D'], options_hi: ['अ','ब','स','द'],
        correctAnswer: 2
    });
    assert(!q.isInvalid, 'should be valid');
    assert(q.explanation_en.length > 0, 'explanation_en must exist');
    assert(q.explanation_hi.length > 0, 'explanation_hi must exist');
});

test('normalizeBank returns stats with correct counts', () => {
    const raw = [
        { id: 'G', question_en: 'Q?', question_hi: 'क?', options_en: ['A','B','C','D'], options_hi: ['अ','ब','स','द'], correctAnswer: 0 },
        { id: 'BAD' } // invalid
    ];
    const { valid, invalid, stats } = normalizeBank(raw);
    assert(valid.length === 1, 'one valid');
    assert(invalid.length === 1, 'one invalid');
    assert(stats.total === 2);
});

// ── Phase 6/7: selectQuestions ─────────────────────────────────────────────
console.log('\n[Phase 6/7] selectQuestions tests');

const mockPool = Array.from({ length: 20 }, (_, i) => ({
    id: 'Q' + i,
    question_en: 'Question ' + i + '?',
    question_hi: 'प्रश्न ' + i + '?',
    options_en: ['A','B','C','D'],
    options_hi: ['अ','ब','स','द'],
    correctAnswer: 0,
    explanation_en: 'Correct',
    explanation_hi: 'सही'
}));

test('selects exact count from pool', () => {
    const { selected, stats } = selectQuestions(mockPool, 10);
    assert(selected.length === 10, 'expected 10 got ' + selected.length);
    assert(stats.served === 10);
});

test('no duplicate IDs in selection', () => {
    const { selected } = selectQuestions(mockPool, 15);
    const ids = new Set(selected.map(q => q.id));
    assert(ids.size === selected.length, 'duplicates found in selection');
});

test('excludes recently seen question IDs', () => {
    const excludeIds = new Set(['Q0','Q1','Q2','Q3','Q4']);
    const { selected, stats } = selectQuestions(mockPool, 10, excludeIds);
    const selectedIds = selected.map(q => q.id);
    assert(!selectedIds.includes('Q0'), 'Q0 should be excluded');
    assert(stats.historyExcluded === 5);
});

test('falls back to full pool when fresh pool too small', () => {
    const bigExclude = new Set(mockPool.map(q => q.id));
    const { selected, stats } = selectQuestions(mockPool, 5, bigExclude);
    assert(selected.length === 5, 'should still serve 5 via fallback');
    assert(stats.usedFallback === true);
});

test('invalid questions filtered before selection', () => {
    const withInvalid = [...mockPool, { id: 'BAD', question_en: 'Bad?', options_en: ['A','B'], correctAnswer: 0 }];
    const { selected, stats } = selectQuestions(withInvalid, 5);
    const badInSelection = selected.find(q => q.id === 'BAD');
    assert(!badInSelection, 'invalid question should not appear in selection');
    assert(stats.afterIntegrityFilter < stats.poolTotal, 'integrity filter should remove invalid');
});

test('shuffleFair does not mutate original array', () => {
    const original = [...mockPool];
    const shuffled = shuffleFair(mockPool);
    assert(shuffled.length === original.length, 'length preserved');
    assert(shuffled !== mockPool, 'should be a new array');
});

test('count greater than pool returns full pool without error', () => {
    const { selected, stats } = selectQuestions(mockPool, 999);
    assert(selected.length === mockPool.length, 'should return full pool');
    assert(stats.served === mockPool.length);
});

// ── Summary ────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(50));
console.log('Validation Results: ' + pass + ' passed, ' + fail + ' failed');
if (fail === 0) console.log('✅ ALL PHASES VALIDATED');
else { console.log('❌ FAILURES DETECTED — see above'); process.exit(1); }
