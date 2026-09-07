import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  prefix: { type: String, required: true },
  year: { type: Number, required: true },
  sequence: { type: Number, default: 0 }
});

counterSchema.index({ company: 1, prefix: 1, year: 1 }, { unique: true });

const Counter = mongoose.model('Counter', counterSchema);

export async function generateDocumentNumber(prefix, companyId) {
  const currentYear = new Date().getFullYear();
  const query = { prefix, year: currentYear };
  if (companyId) {
    query.company = companyId;
  }
  
  const counter = await Counter.findOneAndUpdate(
    query,
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const seqString = String(counter.sequence).padStart(4, '0');
  return `${prefix}-${currentYear}-${seqString}`;
}
