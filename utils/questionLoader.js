const fs = require('fs').promises;
const path = require('path');

/**
 * Load and normalize questions from JSON file
 * @param {string} subject Subject name
 * @returns {Promise<Array>} Array of questions
 */
async function loadQuestions(subject) {
    try {
        // Prevent directory traversal
        const safeSubject = path.basename(subject);
        const dataPath = path.join(__dirname, '../data', `${safeSubject}.json`);
        
        console.log(`[loader] Attempting to load: ${dataPath}`);
        
        const data = await fs.readFile(dataPath, 'utf-8');
        console.log(`[loader] File read successfully: ${safeSubject}.json (${data.length} bytes)`);
        const parsedData = JSON.parse(data);
        
        let raw = Array.isArray(parsedData) ? parsedData : (parsedData.questions || []);
        
        // Return raw questions, frontend handles normalization (L.q, L.opt)
        return raw;
    } catch (error) {
        console.error(`[questionLoader] Error loading questions for ${subject}:`, error.message);
        return [];
    }
}

module.exports = {
    loadQuestions
};
