import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, trim: true },
  entityType: { type: String, required: true, trim: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, trim: true },
  userAgent: { type: String, trim: true },
}, { timestamps: true });

auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ organizationId: 1, entityType: 1, entityId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
