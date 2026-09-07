import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true, enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT'] },
  module: { type: String, required: true },
  documentId: { type: String },
  details: { type: Object },
  ipAddress: { type: String }
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
