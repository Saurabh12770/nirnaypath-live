const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('nirnaypath');

  // ─── QUESTIONS ────────────────────────────────────────────────────────────
  const qTotal = await db.collection('questions').countDocuments();
  const qByExam = await db.collection('questions').aggregate([
    { $group: { _id: '$exam', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  const qBySubject = await db.collection('questions').aggregate([
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  // ─── LEARNING CONTENT ─────────────────────────────────────────────────────
  const lcTotal = await db.collection('learningcontents').countDocuments();
  const lcByExam = await db.collection('learningcontents').aggregate([
    { $group: { _id: '$exam', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  // ─── PLACEHOLDER DETECTION ────────────────────────────────────────────────
  const placeholder1 = await db.collection('learningcontents').countDocuments({
    detailedExplanation: { $regex: 'currently being updated', $options: 'i' }
  });
  const placeholder2 = await db.collection('learningcontents').countDocuments({
    concepts: { $elemMatch: { $regex: 'Key Terminology', $options: 'i' } }
  });
  const placeholder3 = await db.collection('learningcontents').countDocuments({
    concepts: { $elemMatch: { $regex: 'Fundamental Framework', $options: 'i' } }
  });
  const placeholder4 = await db.collection('learningcontents').countDocuments({
    revisionNotes: { $regex: 'Quick bullet points summarizing', $options: 'i' }
  });

  // Sample of placeholder docs
  const samplePlaceholders = await db.collection('learningcontents').find({
    detailedExplanation: { $regex: 'currently being updated', $options: 'i' }
  }, { projection: { exam: 1, subject: 1, topic: 1, subtopic: 1 } }).limit(10).toArray();

  // ─── SUBJECT COVERAGE CHECK ───────────────────────────────────────────────
  const uniqueTopics = await db.collection('learningcontents').distinct('topic');
  const uniqueExamsInLC = await db.collection('learningcontents').distinct('exam');
  const uniqueExamsInQ = await db.collection('questions').distinct('exam');

  // ─── EMPTY / BAD QUESTIONS ────────────────────────────────────────────────
  const emptyQText = await db.collection('questions').countDocuments({
    $or: [
      { 'question.en': '' },
      { 'question.en': { $exists: false } }
    ]
  });
  const missingOptions = await db.collection('questions').countDocuments({
    $or: [
      { options: { $size: 0 } },
      { options: { $exists: false } }
    ]
  });

  // ─── DUPLICATE CHECK ──────────────────────────────────────────────────────
  const dupCheck = await db.collection('questions').aggregate([
    { $group: { _id: '$question.en', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: 'duplicates' }
  ]).toArray();

  // ─── PRINT RESULTS ────────────────────────────────────────────────────────
  console.log('\n============================');
  console.log('  NIRNAYPATH FORENSIC AUDIT');
  console.log('============================\n');

  console.log('── QUESTIONS IN MONGODB ──────────────────');
  console.log('Total questions:', qTotal);
  console.log('\nBy Exam:');
  qByExam.forEach(r => console.log(`  ${(r._id || 'null').padEnd(20)} ${r.count}`));
  console.log('\nBy Subject:');
  qBySubject.forEach(r => console.log(`  ${(r._id || 'null').padEnd(30)} ${r.count}`));

  console.log('\n── LEARNING CONTENT IN MONGODB ───────────');
  console.log('Total learningcontent docs:', lcTotal);
  console.log('\nBy Exam:');
  lcByExam.forEach(r => console.log(`  ${(r._id || 'null').padEnd(20)} ${r.count}`));
  console.log('\nUnique exams in LC:', uniqueExamsInLC);
  console.log('Unique exams in Q:', uniqueExamsInQ);
  console.log('Unique topics in LC:', uniqueTopics.length);

  console.log('\n── PLACEHOLDER CONTENT DETECTION ─────────');
  console.log('"currently being updated" text:', placeholder1);
  console.log('"Key Terminology" in concepts:', placeholder2);
  console.log('"Fundamental Framework" in concepts:', placeholder3);
  console.log('"Quick bullet points summarizing" in revisionNotes:', placeholder4);
  console.log('\nSample placeholder docs:');
  samplePlaceholders.forEach(d => console.log(`  ${d.exam} | ${d.subject} | ${d.topic} | ${d.subtopic}`));

  console.log('\n── QUESTION QUALITY ──────────────────────');
  console.log('Questions with empty question text:', emptyQText);
  console.log('Questions with no options:', missingOptions);
  console.log('Questions with duplicate text:', dupCheck[0]?.duplicates || 0);

  await client.close();
  console.log('\n✅ Audit complete.');
}

run().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
