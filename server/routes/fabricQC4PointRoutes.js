import express from 'express';
import FabricQC4Point from '../models/FabricQC4Point.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';

const router = express.Router();

router.get('/', protect, getAll(FabricQC4Point, 'createdBy'));
router.get('/:id', protect, getOne(FabricQC4Point, 'createdBy'));
router.post('/', protect, managerOrAdmin, createOne(FabricQC4Point));
router.put('/:id', protect, managerOrAdmin, updateOne(FabricQC4Point));
router.delete('/:id', protect, managerOrAdmin, deleteOne(FabricQC4Point));

export default router;
