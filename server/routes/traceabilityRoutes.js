import express from 'express';
import { globalSearch, getDigitalThreadGenealogy } from '../controllers/traceabilityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/search', globalSearch);
router.get('/:id', getDigitalThreadGenealogy);

export default router;
