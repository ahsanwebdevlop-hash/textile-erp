import AuditLog from '../models/AuditLog.js';

const sensitiveKeys = new Set(['password', 'token', 'authorization', 'emailVerificationToken', 'emailVerificationExpires']);

const sanitizeMetadata = (value) => {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitizeMetadata);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !sensitiveKeys.has(key))
      .map(([key, nestedValue]) => [key, sanitizeMetadata(nestedValue)])
  );
};

export const recordAudit = async (req, { action, entityType, entityId, metadata = {} }) => {
  if (!req.user?._id || !req.organization?._id) return;
  try {
    await AuditLog.create({
      action,
      entityType,
      entityId,
      organizationId: req.organization._id,
      userId: req.user._id,
      metadata: sanitizeMetadata(metadata),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR]', error.message);
  }
};
