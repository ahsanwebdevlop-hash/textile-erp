import mongoose from 'mongoose';

const batchLotSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  rollNumber: { type: String, required: [true, 'Roll number is required'], trim: true },
  lotNumber: { type: String, required: [true, 'Lot number is required'], trim: true },
  materialType: { type: String, enum: ['Raw Fabric', 'Yarn', 'Trims', 'Dye Chemical', 'Finished Goods'], default: 'Raw Fabric' },
  fabricName: { type: String, required: true, trim: true },
  shadeGroup: { type: String, enum: ['Shade A (Dark)', 'Shade B (Medium)', 'Shade C (Light)', 'Unassigned'], default: 'Unassigned' },
  receivedQuantity: { type: Number, required: true, min: 0 },
  usableQuantity: { type: Number, required: true, min: 0 },
  consumedQuantity: { type: Number, default: 0, min: 0 },
  remainingQuantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'KG' },
  lengthMeters: { type: Number, default: 0 },
  widthInches: { type: Number, default: 0 },
  gsm: { type: Number, default: 0 },
  shrinkagePercent: { type: Number, default: 0 },
  status: { type: String, enum: ['Raw', 'Dyeing', 'Inspected', 'Approved', 'Rejected', 'Issued to Cutting', 'Fully Consumed'], default: 'Raw' },
  warehouseLocation: { type: String, default: 'Main Warehouse Bin-A1' },
  supplier: { type: String, required: true },
  productionOrderRef: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const BatchLot = mongoose.model('BatchLot', batchLotSchema);
export default BatchLot;
