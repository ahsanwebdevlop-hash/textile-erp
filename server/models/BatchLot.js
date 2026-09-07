import mongoose from 'mongoose';

const batchLotSchema = new mongoose.Schema({
  rollNumber: { type: String, required: [true, 'Roll number is required'], trim: true },
  lotNumber: { type: String, required: [true, 'Lot number is required'], trim: true },
  fabricName: { type: String, required: true, trim: true },
  shadeGroup: { type: String, enum: ['Shade A (Dark)', 'Shade B (Medium)', 'Shade C (Light)', 'Unassigned'], default: 'Unassigned' },
  grossWeightKg: { type: Number, required: true, min: 0 },
  netWeightKg: { type: Number, required: true, min: 0 },
  lengthMeters: { type: Number, required: true, min: 0 },
  widthInches: { type: Number, required: true, min: 0 },
  gsm: { type: Number, required: true, min: 0 },
  shrinkagePercent: { type: Number, default: 0 },
  status: { type: String, enum: ['Raw', 'Dyeing', 'Inspected', 'Approved', 'Rejected', 'Issued to Cutting'], default: 'Raw' },
  warehouseLocation: { type: String, default: 'Main Warehouse Bin-A1' },
  supplier: { type: String, required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

batchLotSchema.index({ organizationId: 1, rollNumber: 1 }, { unique: true });

const BatchLot = mongoose.model('BatchLot', batchLotSchema);
export default BatchLot;
