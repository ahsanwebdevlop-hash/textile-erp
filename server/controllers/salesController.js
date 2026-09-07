import SalesOrder from '../models/SalesOrder.js';
import { getAll, getOne, deleteOne } from './baseController.js';
import { generateDocumentNumber } from '../utils/documentNumbering.js';
import AuditLog from '../models/AuditLog.js';

export const createSalesOrder = async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const { quantity, unitPrice, price } = req.body;
    const itemPrice = Number(unitPrice || price || 0);
    const totalAmount = Number(quantity || 1) * itemPrice;
    
    const orderNumber = req.body.orderNumber || await generateDocumentNumber('SO', companyId);

    const order = await SalesOrder.create({
      ...req.body,
      company: companyId,
      orderNumber,
      unitPrice: itemPrice,
      totalAmount: req.body.totalAmount || totalAmount,
      createdBy: req.user._id
    });

    if (req.user) {
      await AuditLog.create({
        company: companyId,
        user: req.user._id,
        userName: req.user.name,
        action: 'CREATE',
        module: 'Sales Orders',
        documentId: order._id,
        details: { orderNumber: order.orderNumber, customer: order.customerName, total: order.totalAmount }
      });
    }
    
    res.status(201).json({ success: true, data: order });
  } catch (error) { next(error); }
};

export const getSalesOrders = getAll(SalesOrder, 'createdBy', 'Sales Orders');

export const getSalesOrder = getOne(SalesOrder, 'createdBy', 'Sales Orders');

export const updateSalesOrder = async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const query = { _id: req.params.id };
    if (companyId) query.company = companyId;

    const { quantity, unitPrice, price } = req.body;
    const updateData = { ...req.body };
    
    if (quantity && (unitPrice || price)) {
      updateData.totalAmount = Number(quantity) * Number(unitPrice || price);
    }
    
    const order = await SalesOrder.findOneAndUpdate(query, updateData, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Sales order not found' });
    
    if (req.user) {
      await AuditLog.create({
        company: companyId,
        user: req.user._id,
        userName: req.user.name,
        action: 'UPDATE',
        module: 'Sales Orders',
        documentId: order._id,
        details: { orderNumber: order.orderNumber, status: order.orderStatus }
      });
    }

    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

export const deleteSalesOrder = deleteOne(SalesOrder, 'Sales Orders');

export const getSalesStats = async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const match = companyId ? { company: companyId } : {};

    const [statusStats, totalRevenue, topCustomers] = await Promise.all([
      SalesOrder.aggregate([{ $match: match }, { $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      SalesOrder.aggregate([{ $match: { ...match, orderStatus: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      SalesOrder.aggregate([
        { $match: { ...match, orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: '$customerName', totalOrders: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 }
      ])
    ]);
    
    res.json({ 
      success: true, 
      data: { 
        statusStats, 
        totalRevenue: totalRevenue[0]?.total || 0,
        topCustomers 
      } 
    });
  } catch (error) { next(error); }
};

export const getCustomerHistory = async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const { customerName } = req.params;
    const query = { customerName };
    if (companyId) query.company = companyId;

    const history = await SalesOrder.find(query).sort({ createdAt: -1 });
    const stats = await SalesOrder.aggregate([
      { $match: query },
      { $group: { _id: null, totalOrders: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' }, avgOrder: { $avg: '$totalAmount' } } }
    ]);
    
    res.json({ 
      success: true, 
      data: { 
        history, 
        stats: stats[0] || { totalOrders: 0, totalSpent: 0, avgOrder: 0 } 
      } 
    });
  } catch (error) { next(error); }
};