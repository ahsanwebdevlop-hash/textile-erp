import mongoose from 'mongoose';

const bundleSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  bundleId: { type: String, required: [true, 'Bundle ID is required'], trim: true },
  barcode: { type: String, required: true },
  salesOrderRef: { type: String, default: '' },
  productionOrderRef: { type: String, default: '' },
  styleNumber: { type: String, required: true, trim: true },
  styleName: { type: String, default: '' },
  color: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  fabricRollNumber: { type: String, default: '' },
  lotNumber: { type: String, default: '' },
  cuttingOperator: { type: String, default: '' },
  assignedSewingLine: { type: String, default: 'Line-1' },
  currentDepartment: { 
    type: String, 
    enum: ['Cutting', 'Sewing', 'Washing/Printing', 'Finishing', 'Quality Audit', 'Packed', 'Completed'], 
    default: 'Cutting' 
  },
  status: { type: String, enum: ['Cut', 'In Sewing', 'In Finishing', 'Passed QC', 'Rejected', 'Completed'], default: 'Cut' },
  movementHistory: [{
    department: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    scannedBy: { type: String, default: 'Operator' },
    notes: { type: String, default: '' }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Bundle = mongoose.model('Bundle', bundleSchema);
export default Bundle;
