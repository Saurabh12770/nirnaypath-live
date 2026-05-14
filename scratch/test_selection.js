const QuestionSelectionService = require('../utils/questionSelectionService');

async function testSelection() {
    const pool = [
        { id: '1', topic: 'history' },
        { id: '2', topic: 'history' },
        { id: '3', topic: 'history' },
        { id: '1', topic: 'history' }, // Duplicate
        { id: '4', topic: 'geography' }
    ];

    console.log('--- Testing Pool Deduplication ---');
    const deduped = QuestionSelectionService.deduplicatePool(pool);
    console.log('Deduped Pool Size:', deduped.length);
    console.log('Expected: 4');

    console.log('--- Testing Selection (No History) ---');
    const selected = await QuestionSelectionService.select(pool, 10);
    console.log('Selected Count:', selected.length);
    console.log('Expected: 4 (pool too small, fallback should not duplicate)');

    console.log('--- Testing Fisher-Yates Shuffle (No Mutation) ---');
    const original = [1, 2, 3, 4, 5];
    const shuffled = QuestionSelectionService.shuffle(original);
    console.log('Original:', original);
    console.log('Shuffled:', shuffled);
    console.log('Mutation check:', original[0] === 1 && original[1] === 2 ? 'PASS' : 'FAIL');
}

testSelection().catch(console.error);
