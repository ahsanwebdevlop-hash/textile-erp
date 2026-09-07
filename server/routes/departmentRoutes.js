import express from 'express';
import { body, query } from 'express-validator';
import Department from '../models/Department.js';
import { protect, requireOrganization, adminOnly, managerOrAdmin } from '../middleware/auth.js';
import { getAll, createOne, updateOne } from '../controllers/baseController.js';

const router = express.Router();

router.use(protect, requireOrganization, managerOrAdmin);

router.get('/', [
  query('status').optional().isIn(['active', 'archived'])
], getAll(Department, 'createdBy'));

router.post('/', adminOnly, [
  body('name').trim().notEmpty().withMessage('Department name is required')
], createOne(Department));

router.put('/:id', adminOnly, [
  body('name').optional().trim().notEmpty().withMessage('Department name cannot be empty'),
  body('status').optional().isIn(['active', 'archived']).withMessage('Invalid department status')
], updateOne(Department));

export default router;
