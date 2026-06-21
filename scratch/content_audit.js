import mongoose from 'mongoose';

async function audit() {
  try {
    await mongoose.connect('mongodb://localhost:27017/nirnaypath');
    const db = mongoose.connection.db;

    // Count questions by exam
    const qByExam = await db.collection('questions').aggregate([
      { $group: { _id: '$exam', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Count learning content by exam
    const lcByExam = await db.collection('learningcontents').aggregate([
      { $group: { _id: '$exam', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Count learning content by exam+subject
    const lcByExamSubject = await db.collection('learningcontents').aggregate([
      { $group: { _id: { exam: '$exam', subject: '$subject' }, count: { $sum: 1 } } },
      { $sort: { '_id.exam': 1, count: -1 } }
    ]).toArray();

    // Get distinct subjects per exam
    const distinctSubjects = await db.collection('learningcontents').aggregate([
      { $group: { _id: { exam: '$exam', subject: '$subject' } } },
      { $group: { _id: '$_id.exam', subjects: { $push: '$_id.subject' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Check content quality - how many have detailedExplanation
    const withDetailed = await db.collection('learningcontents').countDocuments({ detailedExplanation: { $exists: true, $ne: '' } });
    const withPyqs = await db.collection('learningcontents').countDocuments({ 'pyqs.0': { $exists: true } });
    const withTables = await db.collection('learningcontents').countDocuments({ 'tables.0': { $exists: true } });
    const withFacts = await db.collection('learningcontents').countDocuments({ 'importantFacts.0': { $exists: true } });
    const withRevision = await db.collection('learningcontents').countDocuments({ revisionNotes: { $exists: true, $ne: '' } });
    const total = await db.collection('learningcontents').countDocuments();

    console.log('\n════════════════════════════════════════════════════');
    console.log('  NIRNAYPATH CONTENT COVERAGE AUDIT');
    console.log('════════════════════════════════════════════════════\n');

    console.log('📊 QUESTIONS BY EXAM:');
    let totalQ = 0;
    for (const q of qByExam) { console.log(`  ${(q._id || 'Unknown').padEnd(20)} ${q.count}`); totalQ += q.count; }
    console.log(`  ${'TOTAL'.padEnd(20)} ${totalQ}\n`);

    console.log('📚 LEARNING CONTENT BY EXAM:');
    for (const lc of lcByExam) console.log(`  ${(lc._id || 'Unknown').padEnd(20)} ${lc.count}`);
    console.log(`  ${'TOTAL'.padEnd(20)} ${total}\n`);

    console.log('📖 LEARNING CONTENT BY EXAM → SUBJECT:');
    for (const lc of lcByExamSubject) console.log(`  ${lc._id.exam.padEnd(12)} ${(lc._id.subject || '').padEnd(35)} ${lc.count}`);

    console.log('\n🎯 CONTENT QUALITY METRICS:');
    console.log(`  With detailedExplanation:  ${withDetailed}/${total} (${Math.round(withDetailed/total*100)}%)`);
    console.log(`  With PYQs:                 ${withPyqs}/${total} (${Math.round(withPyqs/total*100)}%)`);
    console.log(`  With Tables:               ${withTables}/${total} (${Math.round(withTables/total*100)}%)`);
    console.log(`  With Important Facts:       ${withFacts}/${total} (${Math.round(withFacts/total*100)}%)`);
    console.log(`  With Revision Notes:        ${withRevision}/${total} (${Math.round(withRevision/total*100)}%)`);

    console.log('\n📋 SUBJECTS PER EXAM:');
    for (const d of distinctSubjects) {
      console.log(`  ${d._id} (${d.count} subjects): ${d.subjects.join(', ')}`);
    }

    console.log('\n════════════════════════════════════════════════════');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

audit();
