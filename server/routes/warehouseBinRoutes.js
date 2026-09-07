import express from 'express';
import WarehouseBin from '../models/WarehouseBin.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';

const router = express.Router();

router.get('/', protect, getAll(WarehouseBin, 'createdBy'));
router.get('/:id', protect, getOne(WarehouseBin, 'createdBy'));
router.post('/', protect, managerOrAdmin, createOne(WarehouseBin));
router.put('/:id', protect, managerOrAdmin, updateOne(WarehouseBin));
router.delete('/:id', protect, managerOrAdmin, deleteOne(WarehouseBin));

export default router;
