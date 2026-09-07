import express from 'express';
import CapacityPlan from '../models/CapacityPlan.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';

const router = express.Router();

router.get('/', protect, getAll(CapacityPlan, 'createdBy'));
router.get('/:id', protect, getOne(CapacityPlan, 'createdBy'));
router.post('/', protect, managerOrAdmin, createOne(CapacityPlan));
router.put('/:id', protect, managerOrAdmin, updateOne(CapacityPlan));
router.delete('/:id', protect, managerOrAdmin, deleteOne(CapacityPlan));

export default router;
