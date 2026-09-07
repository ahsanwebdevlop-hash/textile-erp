import express from 'express';
import ShadeBank from '../models/ShadeBank.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAll(ShadeBank, '', 'Shade Bank'))
  .post(managerOrAdmin, createOne(ShadeBank, 'Shade Bank'));

router.route('/:id')
  .get(getOne(ShadeBank, '', 'Shade Bank'))
  .put(managerOrAdmin, updateOne(ShadeBank, 'Shade Bank'))
  .delete(managerOrAdmin, deleteOne(ShadeBank, 'Shade Bank'));

export default router;
