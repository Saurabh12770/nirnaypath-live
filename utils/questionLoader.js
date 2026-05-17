const fs = require('fs').promises;
const path = require('path');

// Phase 6: SingleFlight Loading to prevent OOM during concurrent cache misses
const loadingPromises = new Map();

/**
 * Load and normalize questions from JSON file
 * @param {string} subject Subject name
 * @returns {Promise<Array>} Array of questions
 */
async function loadQuestions(subject) {
    const safeSubject = path.basename(subject);
    
    if (loadingPromises.has(safeSubject)) {
        console.log(`[loader] Attaching to existing load promise for: ${safeSubject}`);
        return loadingPromises.get(safeSubject);
    }

    const loadPromise = (async () => {
        try {
            const dataPath = path.join(__dirname, '../../data', `${safeSubject}.json`);
            console.log(`[loader] Primary load started: ${dataPath}`);
            
            const data = await fs.readFile(dataPath, 'utf-8');
            console.log(`[loader] File read success: ${safeSubject}.json (${data.length} bytes)`);
            const parsedData = JSON.parse(data);
            
            let raw = Array.isArray(parsedData) ? parsedData : (parsedData.questions || []);
            
            raw = raw.map(q => {
                if (q.options && q.options.length > 0 && typeof q.options[0] === 'object' && !Array.isArray(q.options[0])) {
                    return {
                        ...q,
                        question_en: q.question?.en || q.question_en || '',
                        question_hi: q.question?.hi || q.question_hi || '',
                        options_en: q.options?.map(o => o.text?.en || '') || [],
                        options_hi: q.options?.map(o => o.text?.hi || '') || [],
                        correctAnswer: q.correctOption ? ['a','b','c','d'].indexOf(q.correctOption) : (q.correctAnswer !== undefined ? q.correctAnswer : 0)
                    };
                }
                return q;
            });
            
            return raw;
        } catch (error) {
            console.error(`[questionLoader] Error loading questions for ${subject}:`, error.message);
            return [];
        } finally {
            loadingPromises.delete(safeSubject);
        }
    })();

    loadingPromises.set(safeSubject, loadPromise);
    return loadPromise;
}

module.exports = {
    loadQuestions
};
