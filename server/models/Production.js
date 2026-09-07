import mongoose from 'mongoose';

const dailyEntrySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  targetQty: { type: Number, default: 0 },
  producedQty: { type: Number, default: 0 },
  rejectedQty: { type: Number, default: 0 },
  reworkQty: { type: Number, default: 0 },
  operatorCount: { type: Number, default: 0 },
  downtimeHours: { type: Number, default: 0 },
  notes: { type: String, default: '' }
});

const productionSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  productionOrderNumber: { type: String, required: [true, 'Production order number is required'], trim: true },
  salesOrderRef: { type: String, trim: true, default: '' },
  salesOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' },
  customerName: { type: String, required: [true, 'Customer name is required'], trim: true },
  styleNumber: { type: String, default: '' },
  productName: { type: String, required: [true, 'Product name is required'], trim: true },
  targetQuantity: { type: Number, required: [true, 'Target quantity is required'], min: 1 },
  completedQuantity: { type: Number, default: 0, min: 0 },
  rejectedQuantity: { type: Number, default: 0, min: 0 },
  processStage: { 
    type: String, 
    enum: ['Cutting', 'Sewing', 'Finishing', 'Washing', 'Printing/Embroidery', 'Packing & Export', 'Completed'], 
    default: 'Cutting' 
  },
  lineOrMachine: { type: String, default: 'Line-1' },
  assignedDepartment: { type: String, default: 'Sewing Department' },
  operatorCount: { type: Number, default: 10 },
  status: { type: String, enum: ['Scheduled', 'In Production', 'On Hold', 'Completed', 'Cancelled'], default: 'Scheduled' },
  lineEfficiencyPercent: { type: Number, default: 85 },
  targetGSM: { type: Number, default: 180 },
  cuttingWastagePercent: { type: Number, default: 2.5 },
  dailyEntries: [dailyEntrySchema],
  startDate: { type: Date, default: Date.now },
  expectedCompletionDate: { type: Date },
  actualCompletionDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Production = mongoose.model('Production', productionSchema);
export default Production;
