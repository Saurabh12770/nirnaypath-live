import mongoose from 'mongoose';

async function count() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    
    const questionsCount = await db.collection('questions').countDocuments();
    const contentCount = await db.collection('learningcontents').countDocuments();
    
    console.log('--- DATABASE COUNT SUMMARY ---');
    console.log(`Total Questions: ${questionsCount}`);
    console.log(`Total LearningContent: ${contentCount}`);
    console.log('------------------------------');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

count();
