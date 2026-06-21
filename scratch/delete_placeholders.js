const { MongoClient } = require('mongodb');

async function cleanPlaceholders() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('nirnaypath');
  const col = db.collection('learningcontents');

  const before = await col.countDocuments();
  console.log('Total LC docs before:', before);

  // Delete all docs that are auto-created placeholders
  const result = await col.deleteMany({
    $or: [
      { exam: 'STATE-PCS' },
      { detailedExplanation: { $regex: 'currently being updated by the administration', $options: 'i' } }
    ]
  });

  const after = await col.countDocuments();
  console.log('Deleted placeholder docs:', result.deletedCount);
  console.log('Total LC docs after:', after);

  await client.close();
  console.log('Done.');
}

cleanPlaceholders().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
