import express from 'express';
import Bundle from '../models/Bundle.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';
import { generateDocumentNumber } from '../utils/documentNumbering.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate-batch', managerOrAdmin, async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const { styleNumber, styleName, color, sizeQuantities = [], fabricRollNumber, cuttingOperator } = req.body;
    
    const createdBundles = [];
    for (const sq of sizeQuantities) {
      const bundleId = await generateDocumentNumber('BUN', companyId);
      const barcode = `BC-${bundleId}`;
      const bundle = await Bundle.create({
        company: companyId,
        bundleId,
        barcode,
        styleNumber,
        styleName,
        color,
        size: sq.size,
        quantity: sq.quantity,
        fabricRollNumber,
        cuttingOperator,
        currentDepartment: 'Cutting',
        status: 'Cut',
        movementHistory: [{ department: 'Cutting', scannedBy: req.user.name, notes: 'Bundle created from cut plan' }],
        createdBy: req.user._id
      });
      createdBundles.push(bundle);
    }

    res.status(201).json({ success: true, count: createdBundles.length, data: createdBundles });
  } catch (error) { next(error); }
});

router.route('/')
  .get(getAll(Bundle, '', 'Bundles'))
  .post(managerOrAdmin, createOne(Bundle, 'Bundles'));

router.route('/:id')
  .get(getOne(Bundle, '', 'Bundles'))
  .put(managerOrAdmin, updateOne(Bundle, 'Bundles'))
  .delete(managerOrAdmin, deleteOne(Bundle, 'Bundles'));

export default router;
