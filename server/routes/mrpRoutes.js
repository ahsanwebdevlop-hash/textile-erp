import express from 'express';
import { calculateMRP, generatePurchaseRequestsFromMRP } from '../controllers/mrpController.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', calculateMRP);
router.post('/generate-po', managerOrAdmin, generatePurchaseRequestsFromMRP);

export default router;
