const mongoose = require('mongoose');

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath');
        console.log('Connected to MongoDB.');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections present:');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(` - ${col.name}: ${count} documents`);
        }

        // Check if there is an admin user
        const users = await db.collection('users').find({}).toArray();
        console.log('Users:');
        users.forEach(u => {
            console.log(` - Email: ${u.email}, Role: ${u.role}, Badges: ${u.badges ? u.badges.length : 0}`);
        });

        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkDB();
