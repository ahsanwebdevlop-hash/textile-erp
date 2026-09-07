import BOM from '../models/BOM.js';
import SalesOrder from '../models/SalesOrder.js';
import Inventory from '../models/Inventory.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import { generateDocumentNumber } from '../utils/documentNumbering.js';

export const calculateMRP = async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const query = companyId ? { company: companyId } : {};
    
    const [salesOrders, boms, inventoryItems] = await Promise.all([
      SalesOrder.find({ ...query, orderStatus: { $in: ['Pending', 'Confirmed', 'In Production'] } }),
      BOM.find(query),
      Inventory.find(query)
    ]);

    const materialMap = {};

    for (const order of salesOrders) {
      // Find matching BOM by styleNumber or productName
      const bom = boms.find(b => b.styleNumber === order.styleNumber || b.styleName.toLowerCase() === order.productName.toLowerCase());
      if (!bom) continue;

      for (const item of bom.items) {
        const key = `${item.materialName}_${item.category}_${item.unit}`;
        const wastageMultiplier = 1 + (item.wastagePercent || 5) / 100;
        const requiredQty = item.consumption * order.quantity * wastageMultiplier;

        if (!materialMap[key]) {
          materialMap[key] = {
            materialName: item.materialName,
            category: item.category,
            unit: item.unit,
            requiredQty: 0,
            onHandQty: 0,
            reservedQty: 0,
            shortageQty: 0,
            estimatedUnitCost: item.unitCost || 0,
            supplierRef: item.supplierRef || 'Default Supplier'
          };
        }
        materialMap[key].requiredQty += requiredQty;
      }
    }

    // Map on hand inventory
    const mrpList = Object.values(materialMap).map(m => {
      const invMatch = inventoryItems.find(i => i.materialName.toLowerCase() === m.materialName.toLowerCase());
      const onHand = invMatch ? invMatch.quantity : 0;
      const reserved = invMatch ? invMatch.reservedQuantity : 0;
      const available = Math.max(0, onHand - reserved);
      const shortage = Math.max(0, m.requiredQty - available);

      return {
        ...m,
        requiredQty: Number(m.requiredQty.toFixed(2)),
        onHandQty: onHand,
        reservedQty: reserved,
        availableQty: available,
        shortageQty: Number(shortage.toFixed(2)),
        status: shortage > 0 ? 'SHORTAGE' : 'SUFFICIENT'
      };
    });

    res.json({ success: true, count: mrpList.length, data: mrpList });
  } catch (error) { next(error); }
};

export const generatePurchaseRequestsFromMRP = async (req, res, next) => {
  try {
    const { items } = req.body; // array of MRP shortage items
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'No items provided for purchase request' });
    }
    const companyId = req.user?.company?._id || req.user?.company;

    const poNumber = await generateDocumentNumber('PR', companyId);
    const poItems = items.map(item => ({
      materialName: item.materialName,
      category: item.category || 'Fabric',
      quantity: item.shortageQty || item.quantity || 100,
      unit: item.unit || 'KG',
      unitPrice: item.estimatedUnitCost || 5.0,
      total: Number(((item.shortageQty || 100) * (item.estimatedUnitCost || 5.0)).toFixed(2))
    }));

    const totalAmount = poItems.reduce((acc, curr) => acc + curr.total, 0);

    const po = await PurchaseOrder.create({
      company: companyId,
      poNumber,
      supplier: items[0]?.supplierRef || 'Auto MRP Supplier',
      items: poItems,
      totalAmount,
      workflowStage: 'Purchase Request',
      status: 'Pending',
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Purchase Request created successfully from MRP shortages', data: po });
  } catch (error) { next(error); }
};
