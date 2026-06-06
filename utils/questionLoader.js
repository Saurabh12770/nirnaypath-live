const fs = require('fs').promises;
const path = require('path');

// Cache to prevent disk reads on cache hits
const memoryCache = new Map();

// SingleFlight Loading to prevent concurrent reading of same file
const loadingPromises = new Map();

/**
 * Load and normalize questions from JSON file
 * @param {string} subject Subject name
 * @returns {Promise<Array>} Array of questions
 */
async function loadQuestions(subject) {
    const safeSubject = path.basename(subject).toLowerCase().trim().replace(/\.[^.]+$/, '');
    
    // Check memory cache
    if (memoryCache.has(safeSubject)) {
        return memoryCache.get(safeSubject);
    }
    
    if (loadingPromises.has(safeSubject)) {
        return loadingPromises.get(safeSubject);
    }

    const loadPromise = (async () => {
        try {
            // Path resolution
            let dataPath = path.join(__dirname, '../data', `${safeSubject}.json`);
            if (!require('fs').existsSync(dataPath)) {
                dataPath = path.join(__dirname, '../../data', `${safeSubject}.json`);
            }
            if (!require('fs').existsSync(dataPath)) {
                dataPath = path.resolve(process.cwd(), 'data', `${safeSubject}.json`);
            }
            
            if (!require('fs').existsSync(dataPath)) {
                console.log(`[loader] File not found: ${safeSubject}.json`);
                return [];
            }
            
            const data = await fs.readFile(dataPath, 'utf-8');
            const parsedData = JSON.parse(data);
            
            let raw = Array.isArray(parsedData) ? parsedData : (parsedData.questions || []);
            
            raw = raw.map(q => {
                let normalizedCorrect = q.correctAnswer;
                if (typeof normalizedCorrect === 'string') {
                    const charVal = normalizedCorrect.toLowerCase().trim();
                    const optIdx = ['a','b','c','d'].indexOf(charVal);
                    if (optIdx !== -1) {
                        normalizedCorrect = optIdx;
                    }
                } else if (q.correctOption !== undefined && q.correctOption !== null) {
                    const optIdx = ['a','b','c','d'].indexOf(String(q.correctOption).toLowerCase().trim());
                    if (optIdx !== -1) {
                        normalizedCorrect = optIdx;
                    }
                }
                if (normalizedCorrect === undefined || normalizedCorrect === null) {
                    normalizedCorrect = 0;
                }

                if (q.options && q.options.length > 0 && typeof q.options[0] === 'object' && !Array.isArray(q.options[0])) {
                    return {
                        ...q,
                        question_en: q.question?.en || q.question_en || '',
                        question_hi: q.question?.hi || q.question_hi || '',
                        options_en: q.options?.map(o => o.text?.en || '') || [],
                        options_hi: q.options?.map(o => o.text?.hi || '') || [],
                        correctAnswer: normalizedCorrect
                    };
                }
                return {
                    ...q,
                    correctAnswer: normalizedCorrect
                };
            });
            
            memoryCache.set(safeSubject, raw);
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
