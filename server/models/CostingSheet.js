import mongoose from 'mongoose';

const costingSheetSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  costingNumber: { type: String, required: [true, 'Costing number is required'], trim: true },
  styleNumber: { type: String, required: true, trim: true },
  styleName: { type: String, default: '' },
  customerName: { type: String, required: true, trim: true },
  currency: { type: String, default: 'USD' },
  orderQuantity: { type: Number, required: true, min: 1 },
  
  // Cost Components per Piece
  fabricCost: { type: Number, default: 0, min: 0 },
  trimsCost: { type: Number, default: 0, min: 0 },
  accessoriesCost: { type: Number, default: 0, min: 0 },
  laborCost: { type: Number, default: 0, min: 0 },
  processingCost: { type: Number, default: 0, min: 0 },
  washingCost: { type: Number, default: 0, min: 0 },
  printingEmbroideryCost: { type: Number, default: 0, min: 0 },
  packagingCost: { type: Number, default: 0, min: 0 },
  overheadCost: { type: Number, default: 0, min: 0 },
  wastageCost: { type: Number, default: 0, min: 0 },
  freightCost: { type: Number, default: 0, min: 0 },
  
  subtotalEstimatedCost: { type: Number, required: true, min: 0 },
  actualCostPerPiece: { type: Number, default: 0, min: 0 },
  variancePerPiece: { type: Number, default: 0 }, // Actual - Estimated
  targetMarginPercent: { type: Number, default: 20, min: 0 },
  quotedFOBPricePerPiece: { type: Number, required: true, min: 0 },
  totalOrderFOBValue: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Draft', 'Quoted', 'Approved', 'Rejected'], default: 'Draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const CostingSheet = mongoose.model('CostingSheet', costingSheetSchema);
export default CostingSheet;
