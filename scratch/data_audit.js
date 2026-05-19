const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

const results = [];

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    let data;
    try {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        data = Array.isArray(raw) ? raw : (raw.questions || raw.data || Object.values(raw).find(v => Array.isArray(v)));
    } catch (e) {
        console.error(`Invalid JSON in ${file}: ${e.message}`);
        results.push({ subject: file, status: 'Invalid JSON', total: 0 });
        return;
    }

    if (!data || !Array.isArray(data)) {
        console.error(`Could not find questions array in ${file}`);
        results.push({ subject: file, status: 'Invalid Structure', total: 0 });
        return;
    }

    const total = data.length;
    let uniqueQuestions = new Set();
    let uniqueIds = new Set();
    let difficulties = { Easy: 0, Medium: 0, Hard: 0 };
    let missingFields = 0;
    let placeholdersFound = 0;

    data.forEach(q => {
        // IDs
        if (q.id) uniqueIds.add(q.id);
        else if (q._id) uniqueIds.add(q._id);
        
        // Uniqueness
        const qTextEn = (q.question && q.question.en) ? q.question.en : (q.question_en || q.question || '');
        const normalized = String(qTextEn).toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
        uniqueQuestions.add(normalized);

        // Required fields
        const hasId = !!(q.id || q._id);
        const hasQuestion = (q.question && q.question.en && q.question.hi) || (q.question_en && q.question_hi);
        const hasOptions = (q.options && q.options.length === 4) || (q.options_en && q.options_en.length === 4);
        const hasCorrectOption = q.correctOption !== undefined || q.correctAnswer !== undefined || q.answer !== undefined;
        const hasExplanation = (q.explanation && q.explanation.en && q.explanation.hi) || (q.explanation_en && q.explanation_hi);
        const hasDifficulty = !!q.difficulty;
        const hasSubject = !!q.subject;
        const hasTopic = !!(q.topic || q.topicId);

        if (!hasId || !hasQuestion || !hasOptions || !hasCorrectOption || !hasExplanation || !hasDifficulty || !hasSubject || !hasTopic) {
            missingFields++;
        }

        // Difficulty
        if (q.difficulty) {
            const diff = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase();
            if (difficulties[diff] !== undefined) difficulties[diff]++;
        }

        // Banned placeholders
        const strForm = JSON.stringify(q);
        if (strForm.includes('Distractor Option') || strForm.includes('Valid specific statement') || strForm.includes('Concept Variant')) {
            placeholdersFound++;
        }
    });

    const uniqueCount = uniqueQuestions.size;
    const uniquePercent = total > 0 ? (uniqueCount / total) * 100 : 0;
    const isPoisoned = uniquePercent < 90 || placeholdersFound > 0;
    const idUniquePercent = total > 0 ? (uniqueIds.size / total) * 100 : 0;

    results.push({
        subject: file,
        status: isPoisoned ? 'Poisoned' : 'Clean',
        total,
        uniquePercent: uniquePercent.toFixed(2) + '%',
        idUniquePercent: idUniquePercent.toFixed(2) + '%',
        easyPercent: total > 0 ? ((difficulties.Easy / total) * 100).toFixed(2) + '%' : '0%',
        mediumPercent: total > 0 ? ((difficulties.Medium / total) * 100).toFixed(2) + '%' : '0%',
        hardPercent: total > 0 ? ((difficulties.Hard / total) * 100).toFixed(2) + '%' : '0%',
        missingFields,
        placeholdersFound
    });
});

console.table(results);
