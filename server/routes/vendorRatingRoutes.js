import express from 'express';
import VendorRating from '../models/VendorRating.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';

const router = express.Router();

router.get('/', protect, getAll(VendorRating, 'createdBy'));
router.get('/:id', protect, getOne(VendorRating, 'createdBy'));
router.post('/', protect, managerOrAdmin, createOne(VendorRating));
router.put('/:id', protect, managerOrAdmin, updateOne(VendorRating));
router.delete('/:id', protect, managerOrAdmin, deleteOne(VendorRating));

export default router;
