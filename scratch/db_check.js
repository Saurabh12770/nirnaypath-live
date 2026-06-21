import mongoose from 'mongoose';

async function check() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nirnaypath');
    const db = mongoose.connection.db;
    
    console.log('Distinct topics in questions for UPSC / history:');
    const topics = await db.collection('questions').distinct('topic', { exam: 'UPSC', subject: 'history' });
    console.log(topics);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
