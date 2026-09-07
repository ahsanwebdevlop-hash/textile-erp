import mongoose from 'mongoose';

const bomItemSchema = new mongoose.Schema({
  materialName: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Yarn', 'Fabric', 'Dye Chemical', 'Trim', 'Packaging', 'Accessories', 'Other'], required: true },
  consumption: { type: Number, required: true, min: 0 },
  wastagePercent: { type: Number, default: 5, min: 0 },
  unit: { type: String, required: true, enum: ['KG', 'Meter', 'Grams', 'Yards', 'Pieces', 'Roll', 'Box', 'Cone', 'Set'] },
  unitCost: { type: Number, required: true, min: 0 },
  totalCost: { type: Number, required: true, min: 0 },
  supplierRef: { type: String, default: '' },
});

const bomSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  styleNumber: { type: String, required: [true, 'Style number is required'], trim: true },
  styleName: { type: String, required: [true, 'Style name is required'], trim: true },
  garmentType: { type: String, required: true, enum: ['T-Shirt', 'Polo', 'Denim Jeans', 'Hoodie', 'Dress', 'Bedding', 'Towel', 'Shirt', 'Jacket', 'Other'] },
  season: { type: String, default: 'Spring/Summer 2026' },
  targetGSM: { type: Number, min: 0 },
  fabricComposition: { type: String, trim: true },
  revision: { type: Number, default: 1 },
  status: { type: String, enum: ['Draft', 'Approved', 'Archived'], default: 'Approved' },
  items: [bomItemSchema],
  totalBOMCost: { type: Number, required: true, min: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const BOM = mongoose.model('BOM', bomSchema);
export default BOM;
