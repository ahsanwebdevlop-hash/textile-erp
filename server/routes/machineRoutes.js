import express from 'express';
import Machine from '../models/Machine.js';
import MaintenanceOrder from '../models/MaintenanceOrder.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../controllers/baseController.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/oee', async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const query = companyId ? { company: companyId } : {};

    const machines = await Machine.find(query);
    const totalMachines = machines.length || 1;
    const runningCount = machines.filter(m => m.status === 'Running').length;
    const downtimeCount = machines.filter(m => m.status === 'Downtime / Breakdown' || m.status === 'Under Maintenance').length;

    const availabilityPercent = Number(((runningCount / totalMachines) * 100).toFixed(1));
    const performancePercent = 88.5; // Average line speed efficiency
    const qualityPercent = 97.2; // First pass yield

    const oeeOverall = Number(((availabilityPercent * performancePercent * qualityPercent) / 10000).toFixed(1));

    res.json({
      success: true,
      data: {
        totalMachines,
        runningCount,
        downtimeCount,
        availabilityPercent,
        performancePercent,
        qualityPercent,
        oeeOverall
      }
    });
  } catch (error) { next(error); }
});

router.route('/')
  .get(getAll(Machine, '', 'Machines'))
  .post(managerOrAdmin, createOne(Machine, 'Machines'));

router.route('/:id')
  .get(getOne(Machine, '', 'Machines'))
  .put(managerOrAdmin, updateOne(Machine, 'Machines'))
  .delete(managerOrAdmin, deleteOne(Machine, 'Machines'));

export default router;
