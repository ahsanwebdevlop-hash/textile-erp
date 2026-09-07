import SalesOrder from '../models/SalesOrder.js';
import BOM from '../models/BOM.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Inventory from '../models/Inventory.js';
import BatchLot from '../models/BatchLot.js';
import Production from '../models/Production.js';
import Bundle from '../models/Bundle.js';
import QualityInspection from '../models/QualityInspection.js';
import Shipment from '../models/Shipment.js';
import Transaction from '../models/Transaction.js';
import TechPackSpec from '../models/TechPackSpec.js';

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, results: [] });
    }

    const companyId = req.user?.company?._id || req.user?.company;
    const query = companyId ? { company: companyId } : {};
    const term = q.trim();
    const regex = { $regex: term, $options: 'i' };

    const [sales, pos, rolls, bundles, shipments, specs] = await Promise.all([
      SalesOrder.find({ ...query, $or: [{ orderId: regex }, { customerName: regex }, { productName: regex }, { styleNumber: regex }] }).limit(5),
      PurchaseOrder.find({ ...query, $or: [{ poNumber: regex }, { supplier: regex }] }).limit(5),
      BatchLot.find({ ...query, $or: [{ rollNumber: regex }, { lotNumber: regex }, { fabricName: regex }] }).limit(5),
      Bundle.find({ ...query, $or: [{ bundleId: regex }, { barcode: regex }, { styleNumber: regex }] }).limit(5),
      Shipment.find({ ...query, $or: [{ shipmentNumber: regex }, { customerName: regex }, { commercialInvoiceNumber: regex }] }).limit(5),
      TechPackSpec.find({ ...query, $or: [{ styleNumber: regex }, { styleName: regex }, { buyerName: regex }] }).limit(5)
    ]);

    const results = [];

    sales.forEach(s => results.push({ type: 'Sales Order', title: s.orderId || s.styleNumber, subtitle: `${s.customerName} - ${s.productName}`, url: '/sales-orders' }));
    pos.forEach(p => results.push({ type: 'Purchase Order', title: p.poNumber, subtitle: `Supplier: ${p.supplier} ($${p.totalAmount})`, url: '/purchases' }));
    rolls.forEach(r => results.push({ type: 'Fabric Roll', title: r.rollNumber, subtitle: `${r.fabricName} (Lot: ${r.lotNumber})`, url: '/batch-tracking' }));
    bundles.forEach(b => results.push({ type: 'Garment Bundle', title: b.bundleId, subtitle: `Style ${b.styleNumber} - ${b.color} (${b.size})`, url: '/bundle-wip' }));
    shipments.forEach(sh => results.push({ type: 'Export Invoice', title: sh.shipmentNumber, subtitle: `${sh.customerName} - ${sh.destinationCountry}`, url: '/export-docs' }));
    specs.forEach(sp => results.push({ type: 'Tech Pack Spec', title: sp.styleNumber, subtitle: `${sp.styleName} (${sp.sampleStage})`, url: '/tech-pack-specs' }));

    res.json({ success: true, count: results.length, results });
  } catch (error) { next(error); }
};

export const getDigitalThreadGenealogy = async (req, res, next) => {
  try {
    const companyId = req.user?.company?._id || req.user?.company;
    const { id: searchId } = req.params;
    const query = companyId ? { company: companyId } : {};
    const term = searchId.trim();

    const [salesOrders, boms, purchaseOrders, batchLots, productionOrders, bundles, qualityInspections, shipments] = await Promise.all([
      SalesOrder.find({ ...query, $or: [{ orderId: { $regex: term, $options: 'i' } }, { styleNumber: { $regex: term, $options: 'i' } }] }),
      BOM.find({ ...query, $or: [{ styleNumber: { $regex: term, $options: 'i' } }, { styleName: { $regex: term, $options: 'i' } }] }),
      PurchaseOrder.find({ ...query, $or: [{ poNumber: { $regex: term, $options: 'i' } }, { supplier: { $regex: term, $options: 'i' } }] }),
      BatchLot.find({ ...query, $or: [{ rollNumber: { $regex: term, $options: 'i' } }, { lotNumber: { $regex: term, $options: 'i' } }] }),
      Production.find({ ...query, $or: [{ orderId: { $regex: term, $options: 'i' } }, { customerName: { $regex: term, $options: 'i' } }] }),
      Bundle.find({ ...query, $or: [{ bundleId: { $regex: term, $options: 'i' } }, { barcode: { $regex: term, $options: 'i' } }] }),
      QualityInspection.find({ ...query, $or: [{ inspectionNumber: { $regex: term, $options: 'i' } }, { batchOrOrderId: { $regex: term, $options: 'i' } }] }),
      Shipment.find({ ...query, $or: [{ shipmentNumber: { $regex: term, $options: 'i' } }, { customerName: { $regex: term, $options: 'i' } }] })
    ]);

    res.json({
      success: true,
      searchTerm: term,
      threadGenealogy: {
        salesOrders,
        boms,
        purchaseOrders,
        batchLots,
        productionOrders,
        bundles,
        qualityInspections,
        shipments
      }
    });
  } catch (error) { next(error); }
};
