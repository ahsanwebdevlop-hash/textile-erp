import express from 'express';
import { query } from 'express-validator';
import AuditLog from '../models/AuditLog.js';
import { protect, requireOrganization, adminOnly } from '../middleware/auth.js';
import { getAll } from '../controllers/baseController.js';

const router = express.Router();

router.use(protect, requireOrganization, adminOnly);

router.get('/', [
  query('action').optional().trim(),
  query('entityType').optional().trim(),
], getAll(AuditLog, 'userId'));

export default router;