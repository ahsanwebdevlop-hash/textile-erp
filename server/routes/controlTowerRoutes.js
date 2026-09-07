import express from 'express';
import { getControlTowerMetrics } from '../controllers/controlTowerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getControlTowerMetrics);

export default router;
