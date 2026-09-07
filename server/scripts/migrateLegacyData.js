import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Inventory from '../models/Inventory.js';
import Production from '../models/Production.js';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import SalesOrder from '../models/SalesOrder.js';
import Transaction from '../models/Transaction.js';
import BOM from '../models/BOM.js';
import BatchLot from '../models/BatchLot.js';
import QualityInspection from '../models/QualityInspection.js';
import CostingSheet from '../models/CostingSheet.js';
import ComplianceCertificate from '../models/ComplianceCertificate.js';
import Department from '../models/Department.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

const modelEntries = [
  ['users', User],
  ['employees', Employee],
  ['inventory', Inventory],
  ['productions', Production],
  ['suppliers', Supplier],
  ['purchaseorders', PurchaseOrder],
  ['salesorders', SalesOrder],
  ['transactions', Transaction],
  ['boms', BOM],
  ['batchlots', BatchLot],
  ['qualityinspections', QualityInspection],
  ['costingsheets', CostingSheet],
  ['compliancecertificates', ComplianceCertificate],
  ['departments', Department],
  ['auditlogs', AuditLog],
];

const parseArgs = () => {
  const args = new Set(process.argv.slice(2));
  const mapArgument = process.argv.find(value => value.startsWith('--map='));
  return { apply: args.has('--apply'), mapPath: mapArgument?.slice('--map='.length) };
};

const readMapping = async (mapPath) => {
  if (!mapPath) return {};
  const absolutePath = path.resolve(process.cwd(), mapPath);
  const content = await fs.readFile(absolutePath, 'utf8');
  const mapping = JSON.parse(content);
  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
    throw new Error('Migration map must be a JSON object keyed by collection name');
  }
  return mapping;
};

const redact = (value) => {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);
  const sensitiveKeys = new Set(['password', 'emailVerificationToken', 'emailVerificationExpires']);
  return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [
    key,
    sensitiveKeys.has(key) ? '[REDACTED]' : redact(nestedValue),
  ]));
};

const normalizeId = (value, label) => {
  if (!mongoose.isValidObjectId(value)) throw new Error(`Invalid ObjectId for ${label}: ${value}`);
  return new mongoose.Types.ObjectId(value);
};

const getExplicitOrganizationId = (mapping, collectionName, recordId) => {
  const collectionMapping = mapping[collectionName] || {};
  return collectionMapping[String(recordId)];
};

const validateMappings = async (mapping) => {
  const organizationIds = new Set();
  for (const collectionMapping of Object.values(mapping)) {
    if (!collectionMapping || typeof collectionMapping !== 'object') throw new Error('Each collection mapping must be an object');
    Object.values(collectionMapping).forEach(value => organizationIds.add(String(value)));
  }
  const validIds = new Set((await Organization.find({ _id: { $in: [...organizationIds].map(id => normalizeId(id, 'organizationId')) } }).select('_id')).map(org => String(org._id)));
  const missing = [...organizationIds].filter(id => !validIds.has(id));
  if (missing.length) throw new Error(`Migration map references missing organizations: ${missing.join(', ')}`);
};

const quarantineRecord = async (collectionName, record, reason, apply) => {
  if (!apply) return;
  const quarantine = mongoose.connection.collection('migration_quarantine');
  await quarantine.updateOne(
    { sourceCollection: collectionName, sourceId: record._id },
    {
      $set: {
        sourceCollection: collectionName,
        sourceId: record._id,
        reason,
        snapshot: redact(record),
        capturedAt: new Date(),
      },
    },
    { upsert: true }
  );
};

const migrateCollection = async (collectionName, Model, mapping, apply) => {
  const records = await Model.find({ $or: [{ organizationId: { $exists: false } }, { organizationId: null }] }).lean();
  const result = { collection: collectionName, legacy: records.length, assigned: 0, quarantined: 0 };

  for (const record of records) {
    const explicitOrganizationId = getExplicitOrganizationId(mapping, collectionName, record._id);
    if (!explicitOrganizationId) {
      result.quarantined += 1;
      await quarantineRecord(collectionName, record, 'No explicit approved organization mapping', apply);
      continue;
    }

    const organizationId = normalizeId(explicitOrganizationId, `${collectionName}.${record._id}`);
    if (apply) await Model.updateOne({ _id: record._id, organizationId: { $exists: false } }, { $set: { organizationId } });
    result.assigned += 1;
  }
  return result;
};

const syncIndexes = async (apply) => {
  if (!apply) return;
  for (const [, Model] of modelEntries.filter(([name]) => name !== 'users' && name !== 'auditlogs')) {
    await Model.syncIndexes();
  }
};

const main = async () => {
  const { apply, mapPath } = parseArgs();
  const mapping = await readMapping(mapPath);
  await connectDB();
  await validateMappings(mapping);
  if (apply) {
    await mongoose.connection.collection('migration_quarantine').createIndex(
      { sourceCollection: 1, sourceId: 1 },
      { unique: true }
    );
  }

  const report = [];
  for (const [collectionName, Model] of modelEntries) {
    report.push(await migrateCollection(collectionName, Model, mapping, apply));
  }
  await syncIndexes(apply);

  console.table(report);
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', mapPath: mapPath || null, report }, null, 2));
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(`[MIGRATION_ERROR] ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
