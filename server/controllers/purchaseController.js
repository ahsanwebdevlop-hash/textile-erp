import PurchaseOrder from '../models/PurchaseOrder.js';
import Supplier from '../models/Supplier.js';
import { createOne, getAll, getOne, updateOne, deleteOne } from './baseController.js';
import { recordAudit } from '../services/auditService.js';

export const createPurchase = async (req, res, next) => {
  try {
    const { items, tax = 0, discount = 0, supplierId } = req.body;
    if (supplierId) {
      const supplierExists = await Supplier.exists({ _id: supplierId, organizationId: req.organization._id });
      if (!supplierExists) return res.status(400).json({ success: false, message: 'Supplier does not belong to this organization' });
    }
    const subTotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const totalAmount = subTotal + Number(tax) - Number(discount);
    
    const { organizationId: ignoredOrganizationId, ...body } = req.body;
    const purchase = await PurchaseOrder.create({
      ...body,
      subTotal,
      totalAmount,
      organizationId: req.organization._id,
      createdBy: req.user._id
    });
    
    if (supplierId) {
      await Supplier.findOneAndUpdate({ _id: supplierId, organizationId: req.organization._id }, {
        $inc: { totalPurchases: 1, totalAmountSpent: totalAmount }
      });
    }
    await recordAudit(req, { action: 'create', entityType: 'PurchaseOrder', entityId: purchase._id });
    
    res.status(201).json({ success: true, data: purchase });
  } catch (error) { next(error); }
};

export const getPurchases = getAll(PurchaseOrder, 'createdBy');
export const getPurchase = getOne(PurchaseOrder, 'createdBy');

export const updatePurchase = async (req, res, next) => {
  try {
    const { items, tax = 0, discount = 0 } = req.body;
    if (Object.prototype.hasOwnProperty.call(req.body, 'supplierId') && req.body.supplierId) {
      const supplierExists = await Supplier.exists({ _id: req.body.supplierId, organizationId: req.organization._id });
      if (!supplierExists) return res.status(400).json({ success: false, message: 'Supplier does not belong to this organization' });
    }
    if (items) {
      req.body.subTotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
      req.body.totalAmount = req.body.subTotal + Number(tax) - Number(discount);
    }
    const { organizationId: ignoredOrganizationId, createdBy: ignoredCreatedBy, ...body } = req.body;
    const purchase = await PurchaseOrder.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organization._id },
      body,
      { new: true, runValidators: true }
    );
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase order not found' });
    await recordAudit(req, { action: 'update', entityType: 'PurchaseOrder', entityId: purchase._id, metadata: { status: purchase.status } });
    res.json({ success: true, data: purchase });
  } catch (error) { next(error); }
};

export const deletePurchase = deleteOne(PurchaseOrder);

export const getPurchaseStats = async (req, res, next) => {
  try {
    const organizationId = req.organization._id;
    const [statusStats, totalAmount, recentPurchases] = await Promise.all([
      PurchaseOrder.aggregate([{ $match: { organizationId } }, { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }]),
      PurchaseOrder.aggregate([{ $match: { organizationId } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      PurchaseOrder.find({ organizationId }).sort({ createdAt: -1 }).limit(5).populate('createdBy', 'name')
    ]);
    res.json({ success: true, data: { statusStats, totalAmount: totalAmount[0]?.total || 0, recentPurchases } });
  } catch (error) { next(error); }
};

export const getPurchaseHistory = async (req, res, next) => {
  try {
    const { supplierId } = req.params;
    const history = await PurchaseOrder.find({ supplierId, organizationId: req.organization._id }).sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.json({ success: true, count: history.length, data: history });
  } catch (error) { next(error); }
};