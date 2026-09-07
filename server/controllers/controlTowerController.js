import SalesOrder from '../models/SalesOrder.js';
import Inventory from '../models/Inventory.js';
import Production from '../models/Production.js';
import QualityInspection from '../models/QualityInspection.js';
import ComplianceCertificate from '../models/ComplianceCertificate.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

export const getControlTowerMetrics = async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const query = companyId ? { company: companyId } : {};

    const [
      salesOrders,
      inventory,
      productions,
      qualities,
      compliance,
      purchases
    ] = await Promise.all([
      SalesOrder.find(query),
      Inventory.find(query),
      Production.find(query),
      QualityInspection.find(query),
      ComplianceCertificate.find(query),
      PurchaseOrder.find(query)
    ]);

    const now = new Date();

    // 1. Orders at Risk: Delivery date within 7 days and orderStatus not completed/shipped
    const ordersAtRisk = salesOrders.filter(order => {
      if (['Shipped', 'Completed', 'Cancelled'].includes(order.orderStatus)) return false;
      const daysLeft = (new Date(order.deliveryDate) - now) / (1000 * 60 * 60 * 24);
      return daysLeft <= 7;
    });

    // 2. Material Shortages: Inventory quantity < minStockLevel
    const lowStockAlerts = inventory.filter(item => item.quantity <= item.minStockLevel);

    // 3. Low Efficiency Lines: Production line efficiency < 75%
    const lowEfficiencyLines = productions.filter(p => p.lineEfficiencyPercent < 75 || p.status === 'On Hold');

    // 4. Quality Holds / Failed Inspections
    const qualityHolds = qualities.filter(q => q.status === 'FAILED' || q.status === 'UNDER_REWORK');

    // 5. Expiring Compliance Certificates within 30 days
    const expiringCertificates = compliance.filter(cert => {
      const daysLeft = (new Date(cert.expiryDate) - now) / (1000 * 60 * 60 * 24);
      return daysLeft <= 30;
    });

    // 6. Overdue Purchase Orders
    const overduePOs = purchases.filter(po => {
      if (['Completed', 'Cancelled', 'Goods Received'].includes(po.status || po.workflowStage)) return false;
      return po.expectedDeliveryDate && new Date(po.expectedDeliveryDate) < now;
    });

    res.json({
      success: true,
      data: {
        summary: {
          ordersAtRiskCount: ordersAtRisk.length,
          lowStockCount: lowStockAlerts.length,
          lowEfficiencyCount: lowEfficiencyLines.length,
          qualityHoldsCount: qualityHolds.length,
          expiringCertificatesCount: expiringCertificates.length,
          overduePOCount: overduePOs.length
        },
        ordersAtRisk,
        lowStockAlerts,
        lowEfficiencyLines,
        qualityHolds,
        expiringCertificates,
        overduePOs
      }
    });
  } catch (error) { next(error); }
};
