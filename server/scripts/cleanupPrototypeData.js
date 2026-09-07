import dns from 'node:dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

 dns.setServers(['1.1.1.1', '8.8.8.8']);
dotenv.config();

const legacyCollections = [
  'users',
  'employees',
  'inventories',
  'productions',
  'boms',
  'suppliers',
  'purchaseorders',
  'salesorders',
  'transactions',
  'batchlots',
  'qualityinspections',
  'costingsheets',
  'compliancecertificates',
  'departments',
];

const unscopedFilter = { $or: [{ organizationId: { $exists: false } }, { organizationId: null }] };

const main = async () => {
  if (!process.argv.includes('--apply')) {
    throw new Error('Refusing to mutate data without the --apply flag');
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000, socketTimeoutMS: 45000 });
  const database = mongoose.connection.db;
  const organizationCount = await database.collection('organizations').countDocuments();
  if (organizationCount !== 0) {
    throw new Error(`Refusing cleanup because organizations collection contains ${organizationCount} records`);
  }

  const deletionReport = [];
  for (const collectionName of legacyCollections) {
    const collection = database.collection(collectionName);
    const before = await collection.countDocuments(unscopedFilter);
    const result = await collection.deleteMany(unscopedFilter);
    const after = await collection.countDocuments(unscopedFilter);
    deletionReport.push({ collection: collectionName, before, deleted: result.deletedCount, remainingUnscoped: after });
  }

  console.table(deletionReport);
  if (deletionReport.some(item => item.remainingUnscoped !== 0)) {
    throw new Error('Cleanup completed with remaining unscoped records');
  }
  await mongoose.disconnect();
};

main().catch(async error => {
  console.error(`[CLEANUP_ERROR] ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
