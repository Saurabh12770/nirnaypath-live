const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Question = require('../models/question');

dotenv.config();

async function audit() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath');
        console.log('Connected.');

        const total = await Question.countDocuments();
        console.log('Total Questions in DB:', total);

        if (total > 0) {
            const subjects = await Question.distinct('subject');
            console.log('Available Subjects in DB:', subjects);

            const sample = await Question.findOne();
            console.log('Sample Document Structure:', JSON.stringify(sample, null, 2));
        } else {
            console.log('CRITICAL: Question collection is EMPTY.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Audit Error:', err);
        process.exit(1);
    }
}

audit();
