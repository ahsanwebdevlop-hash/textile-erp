import express from 'express';
import Shipment from '../models/Shipment.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';
import { generateDocumentNumber } from '../utils/documentNumbering.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAll(Shipment, '', 'Shipments'))
  .post(managerOrAdmin, async (req, res, next) => {
    try {
      const companyId = req.user?.company?._id || req.user?.company;
      const shipmentNumber = req.body.shipmentNumber || await generateDocumentNumber('SHIP', companyId);
      const shipment = await Shipment.create({
        ...req.body,
        company: companyId,
        shipmentNumber,
        createdBy: req.user._id
      });
      res.status(201).json({ success: true, data: shipment });
    } catch (error) { next(error); }
  });

router.route('/:id')
  .get(getOne(Shipment, '', 'Shipments'))
  .put(managerOrAdmin, updateOne(Shipment, 'Shipments'))
  .delete(managerOrAdmin, deleteOne(Shipment, 'Shipments'));

export default router;
