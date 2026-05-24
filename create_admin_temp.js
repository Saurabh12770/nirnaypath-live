const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const email = 'admin@example.com';
        const password = 'AdminPassword123!';
        const hashedPassword = await bcrypt.hash(password, 12);

        let user = await User.findOne({ email });
        if (user) {
            user.password = hashedPassword;
            user.role = 'admin';
            user.isActive = true;
            await user.save();
            console.log('Updated existing admin user');
        } else {
            user = new User({
                name: 'Admin User',
                email,
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                plan: 'pro_monthly',
                subscriptionStatus: 'active'
            });
            await user.save();
            console.log('Created new admin user');
        }
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
