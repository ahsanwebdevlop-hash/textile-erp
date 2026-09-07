import express from 'express';
import CutPlan from '../models/CutPlan.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';

const router = express.Router();

router.get('/', protect, getAll(CutPlan, 'createdBy'));
router.get('/:id', protect, getOne(CutPlan, 'createdBy'));
router.post('/', protect, managerOrAdmin, createOne(CutPlan));
router.put('/:id', protect, managerOrAdmin, updateOne(CutPlan));
router.delete('/:id', protect, managerOrAdmin, deleteOne(CutPlan));

export default router;
