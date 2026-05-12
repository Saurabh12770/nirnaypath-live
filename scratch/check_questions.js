const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const Question = require('../models/Question');

async function checkQuestions() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const total = await Question.countDocuments();
        console.log('Total Questions:', total);

        const subjects = await Question.distinct('subject');
        console.log('Unique Subjects:', subjects);

        const subjectIds = await Question.distinct('subjectId');
        console.log('Unique Subject IDs:', subjectIds);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkQuestions();
