
const { loadQuestions } = require('../utils/questionLoader');
const path = require('path');

async function test() {
    try {
        const questions = await loadQuestions('history');
        console.log('Is Array:', Array.isArray(questions));
        console.log('Count:', questions.length);
        if (questions.length > 0) {
            console.log('First Question Topic:', questions[0].topic);
        }
    } catch (err) {
        console.error(err);
    }
}

test();
