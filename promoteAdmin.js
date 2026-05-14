const mongoose = require('mongoose');
const User = require('./models/user');
const dotenv = require('dotenv');

dotenv.config();

async function promoteToAdmin(email) {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`Success: User ${user.email} promoted to ADMIN.`);
        } else {
            console.log(`Error: User with email ${email} not found.`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Promotion failed:', err);
    }
}

const targetEmail = process.argv[2];
if (!targetEmail) {
    console.log('Usage: node promoteAdmin.js <email>');
    process.exit(1);
}

promoteToAdmin(targetEmail);
