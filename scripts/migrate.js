const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const applyIndexes = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for indexing...');

        const User = require('../models/user');
        const TestResult = require('../models/testResult');
        const Payment = require('../models/payment');
        const ChatMessage = require('../models/chatMessage');

        console.log('Applying User indexes...');
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ role: 1 });

        console.log('Applying TestResult indexes...');
        await TestResult.collection.createIndex({ userId: 1, createdAt: -1 });
        await TestResult.collection.createIndex({ exam: 1, subject: 1 });

        console.log('Applying Payment indexes...');
        await Payment.collection.createIndex({ userId: 1 });
        await Payment.collection.createIndex({ razorpay_order_id: 1 }, { unique: true });

        console.log('Applying ChatMessage indexes...');
        await ChatMessage.collection.createIndex({ userId: 1, createdAt: 1 });

        console.log('✅ All indexes applied successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Indexing failed:', err);
        process.exit(1);
    }
};

applyIndexes();
