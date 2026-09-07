import express from 'express';
import Customer from '../models/Customer.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAll(Customer, '', 'Customers'))
  .post(managerOrAdmin, createOne(Customer, 'Customers'));

router.route('/:id')
  .get(getOne(Customer, '', 'Customers'))
  .put(managerOrAdmin, updateOne(Customer, 'Customers'))
  .delete(managerOrAdmin, deleteOne(Customer, 'Customers'));

export default router;
