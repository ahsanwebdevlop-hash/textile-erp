import express from 'express';
import TechPackSpec from '../models/TechPackSpec.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';

const router = express.Router();

router.get('/', protect, getAll(TechPackSpec, 'createdBy'));
router.get('/:id', protect, getOne(TechPackSpec, 'createdBy'));
router.post('/', protect, managerOrAdmin, createOne(TechPackSpec));
router.put('/:id', protect, managerOrAdmin, updateOne(TechPackSpec));
router.delete('/:id', protect, managerOrAdmin, deleteOne(TechPackSpec));

export default router;
