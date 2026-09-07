import express from 'express';
import Automation from '../models/Automation.js';
import { protect, managerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

const DEFAULT_AUTOMATIONS = [
  {
    automationKey: 'AUTO_PR_ON_LOW_STOCK',
    title: 'Auto-Generate Purchase Request on Low Stock',
    category: 'Inventory & MRP',
    description: 'Automatically creates a draft Purchase Request (PR-XXXX) when stock falls below minimum safety stock.',
    enabled: true,
    config: { minThresholdMargin: 10 }
  },
  {
    automationKey: 'DELIVERY_RISK_ALERT',
    title: 'Delivery Risk Alert Engine',
    category: 'Sales & Shipping',
    description: 'Triggers an urgent alert on the Factory Control Tower when an order is within 7 days of delivery and production is below 50%.',
    enabled: true,
    config: { bufferDays: 7 }
  },
  {
    automationKey: 'QUALITY_HOLD_QUARANTINE',
    title: 'Automatic Quality Hold Quarantine',
    category: 'Production & Quality',
    description: 'Places raw fabric rolls or garment production batches on QUALITY HOLD status immediately if an inspection fails AQL standards.',
    enabled: true,
    config: { autoBlockIssuance: true }
  },
  {
    automationKey: 'AUTO_RESERVE_BOM_MATERIALS',
    title: 'Auto-Reserve Inventory Materials on Sales Order Confirmation',
    category: 'Inventory & MRP',
    description: 'Automatically reserves raw fabric, yarn, and trims in inventory as soon as a Sales Order status is changed to Confirmed.',
    enabled: true,
    config: {}
  },
  {
    automationKey: 'AUTO_INVOICE_ON_SHIPMENT',
    title: 'Auto-Generate Commercial Invoice on Dispatch',
    category: 'Finance & Billing',
    description: 'Creates a Commercial Invoice and updates Accounts Receivable as soon as a shipment status is set to Shipped.',
    enabled: false,
    config: { paymentTermsDays: 30 }
  },
  {
    automationKey: 'COMPLIANCE_EXPIRY_WARNING',
    title: 'Compliance Certificate Expiry Reminders',
    category: 'Compliance & Reminders',
    description: 'Sends automated notifications 30 days prior to OEKO-TEX, GOTS, WRAP, or ZDHC certificate expiry.',
    enabled: true,
    config: { reminderDaysBefore: 30 }
  },
  {
    automationKey: 'HIGH_WASTAGE_VARIANCE_FLAG',
    title: 'Cutting & Sewing High Wastage Variance Flag',
    category: 'Production & Quality',
    description: 'Flags production orders where actual fabric/cut wastage exceeds standard BOM wastage by more than 3%.',
    enabled: false,
    config: { maxWastageTolerancePercent: 3 }
  },
  {
    automationKey: 'WHATSAPP_CUSTOMER_NOTIFICATIONS',
    title: 'WhatsApp Order Status Notifications',
    category: 'Sales & Shipping',
    description: 'Sends real-time WhatsApp updates to buyers when their order reaches Cutting, Sewing, QC Passed, or Shipped status.',
    enabled: false,
    config: { sendOnStatus: ['Confirmed', 'Shipped'] }
  }
];

router.get('/', async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    let dbAutomations = await Automation.find({ company: companyId });

    // Seed defaults if empty
    if (dbAutomations.length === 0) {
      const seedList = DEFAULT_AUTOMATIONS.map(item => ({ ...item, company: companyId }));
      dbAutomations = await Automation.insertMany(seedList);
    }

    res.json({ success: true, count: dbAutomations.length, data: dbAutomations });
  } catch (error) { next(error); }
});

router.post('/toggle-multiple', managerOrAdmin, async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const { selections } = req.body; // array of { automationKey, enabled }

    if (!Array.isArray(selections)) {
      return res.status(400).json({ success: false, message: 'Invalid selections format' });
    }

    for (const sel of selections) {
      await Automation.findOneAndUpdate(
        { company: companyId, automationKey: sel.automationKey },
        { enabled: sel.enabled },
        { upsert: true }
      );
    }

    const updated = await Automation.find({ company: companyId });
    res.json({ success: true, message: 'Automation rules updated successfully', data: updated });
  } catch (error) { next(error); }
});

export default router;
