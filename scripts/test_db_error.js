const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// Register global query logger
const { registerGlobalQueryLogger } = require('../services/slowQueryLogger');
registerGlobalQueryLogger(mongoose);

const User = require('../models/user');

(async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath');
        console.log('Connected.');
        
        console.log('Running User.findOne...');
        await User.findOne({ email: 'admin@example.com' });
        console.log('User.findOne finished without error.');
    } catch (err) {
        console.error('🔴 ERROR CAPTURED:', err);
        if (err.stack) {
            console.error('🔴 STACK TRACE:\n', err.stack);
        }
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
})();
