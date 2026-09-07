import express from 'express';
import { body, query } from 'express-validator';
import Production from '../models/Production.js';
import { protect, requireOrganization, managerOrAdmin } from '../middleware/auth.js';
import { getAll, getOne, updateOne, deleteOne } from '../controllers/baseController.js';
import { recordAudit } from '../services/auditService.js';

const router = express.Router();

router.use(protect, requireOrganization);

router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().escape(),
  query('status').optional().isIn(['Pending', 'In Production', 'Completed'])
], getAll(Production, 'createdBy'));

router.get('/:id', protect, getOne(Production, 'createdBy'));

router.post('/', protect, managerOrAdmin, [
  body('orderId').trim().notEmpty().withMessage('Order ID is required'),
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('productName').trim().notEmpty().withMessage('Product name is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('status').optional().isIn(['Pending', 'In Production', 'Completed']),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('completionDate').isISO8601().withMessage('Valid completion date is required')
], async (req, res, next) => {
  try {
    const { organizationId: ignoredOrganizationId, ...body } = req.body;
    const order = await Production.create({ ...body, organizationId: req.organization._id, createdBy: req.user._id });
    await recordAudit(req, { action: 'create', entityType: 'Production', entityId: order._id });
    res.status(201).json({ success: true, data: order });
  } catch (error) { next(error); }
});

router.put('/:id', protect, managerOrAdmin, updateOne(Production));
router.delete('/:id', protect, managerOrAdmin, deleteOne(Production));

export default router;