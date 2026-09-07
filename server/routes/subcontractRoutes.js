import express from 'express';
import Subcontract from '../models/Subcontract.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAll(Subcontract, '', 'Subcontracts'))
  .post(managerOrAdmin, createOne(Subcontract, 'Subcontracts'));

router.route('/:id')
  .get(getOne(Subcontract, '', 'Subcontracts'))
  .put(managerOrAdmin, updateOne(Subcontract, 'Subcontracts'))
  .delete(managerOrAdmin, deleteOne(Subcontract, 'Subcontracts'));

export default router;
