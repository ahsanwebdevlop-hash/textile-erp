import PurchaseOrder from '../models/PurchaseOrder.js';
import Supplier from '../models/Supplier.js';
import { getAll, getOne, deleteOne } from './baseController.js';
import { generateDocumentNumber } from '../utils/documentNumbering.js';
import AuditLog from '../models/AuditLog.js';

export const createPurchase = async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const { items = [], supplierId, supplier } = req.body;
    const calculatedTotal = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
    const totalAmount = req.body.totalAmount || calculatedTotal;

    const poNumber = req.body.poNumber || req.body.purchaseNumber || await generateDocumentNumber('PO', companyId);
    
    const purchase = await PurchaseOrder.create({
      ...req.body,
      company: companyId,
      poNumber,
      supplier: supplier || 'General Supplier',
      totalAmount,
      createdBy: req.user._id
    });
    
    if (supplierId) {
      await Supplier.findByIdAndUpdate(supplierId, {
        $inc: { outstandingBalance: totalAmount }
      });
    }

    if (req.user) {
      await AuditLog.create({
        company: companyId,
        user: req.user._id,
        userName: req.user.name,
        action: 'CREATE',
        module: 'Purchases',
        documentId: purchase._id,
        details: { poNumber: purchase.poNumber, supplier: purchase.supplier, totalAmount: purchase.totalAmount }
      });
    }
    
    res.status(201).json({ success: true, data: purchase });
  } catch (error) { next(error); }
};

export const getPurchases = getAll(PurchaseOrder, 'createdBy', 'Purchases');
export const getPurchase = getOne(PurchaseOrder, 'createdBy', 'Purchases');

export const updatePurchase = async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const query = { _id: req.params.id };
    if (companyId) query.company = companyId;

    const purchase = await PurchaseOrder.findOneAndUpdate(query, req.body, { new: true, runValidators: true });
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    if (req.user) {
      await AuditLog.create({
        company: companyId,
        user: req.user._id,
        userName: req.user.name,
        action: 'UPDATE',
        module: 'Purchases',
        documentId: purchase._id,
        details: { poNumber: purchase.poNumber, status: purchase.status, workflowStage: purchase.workflowStage }
      });
    }

    res.json({ success: true, data: purchase });
  } catch (error) { next(error); }
};

export const deletePurchase = deleteOne(PurchaseOrder, 'Purchases');

export const getPurchaseStats = async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const match = companyId ? { company: companyId } : {};

    const [statusStats, totalAmount, recentPurchases] = await Promise.all([
      PurchaseOrder.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }]),
      PurchaseOrder.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      PurchaseOrder.find(match).sort({ createdAt: -1 }).limit(5).populate('createdBy', 'name')
    ]);
    res.json({ success: true, data: { statusStats, totalAmount: totalAmount[0]?.total || 0, recentPurchases } });
  } catch (error) { next(error); }
};

export const getPurchaseHistory = async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const { supplierId } = req.params;
    const query = { supplierId };
    if (companyId) query.company = companyId;

    const history = await PurchaseOrder.find(query).sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.json({ success: true, count: history.length, data: history });
  } catch (error) { next(error); }
};