import mongoose from 'mongoose';

const complianceCertificateSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  certificateNumber: { type: String, required: [true, 'Certificate number is required'], trim: true },
  certificationType: { type: String, enum: ['OEKO-TEX Standard 100', 'GOTS Organic', 'GRS Recycled', 'ZDHC Chemical Safety', 'ISO 9001 Quality', 'WRAP Social Audit', 'BSCI Audit', 'SMETA Audit', 'Higgs Index'], required: true },
  issuingAuthority: { type: String, required: true, trim: true },
  supplierOrFacility: { type: String, required: true, trim: true },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Expiring Soon', 'Expired', 'Revoked'], default: 'Active' },
  responsiblePerson: { type: String, default: 'Quality/Compliance Lead' },
  findingsCount: { type: Number, default: 0 },
  correctiveActionsNeeded: { type: String, default: '' },
  scopeNotes: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const ComplianceCertificate = mongoose.model('ComplianceCertificate', complianceCertificateSchema);
export default ComplianceCertificate;
