import express from 'express';
import FinancialLedger from '../models/FinancialLedger.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';

const router = express.Router();

router.get('/', protect, getAll(FinancialLedger, 'createdBy'));
router.get('/:id', protect, getOne(FinancialLedger, 'createdBy'));
router.post('/', protect, managerOrAdmin, createOne(FinancialLedger));
router.put('/:id', protect, managerOrAdmin, updateOne(FinancialLedger));
router.delete('/:id', protect, managerOrAdmin, deleteOne(FinancialLedger));

export default router;
