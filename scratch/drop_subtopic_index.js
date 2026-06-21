import mongoose from 'mongoose';

async function dropIndex() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
    console.log(`Connecting to: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    // List indexes on learningcontents
    try {
      const indexes = await db.collection('learningcontents').indexes();
      console.log('Current indexes on learningcontents:', indexes.map(idx => idx.name));
      
      for (const idx of indexes) {
        const nameLower = idx.name.toLowerCase();
        if (nameLower.includes('subtopic') && idx.name !== 'exam_1_subject_1_topic_1_subtopic_1') {
          console.log(`Dropping index ${idx.name}...`);
          await db.collection('learningcontents').dropIndex(idx.name);
          console.log(`Index ${idx.name} dropped successfully.`);
        }
      }
    } catch (err) {
      console.log('Collection learningcontents may not exist yet, or error:', err.message);
    }
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

dropIndex();
