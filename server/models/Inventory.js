import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  sku: { type: String, trim: true },
  materialName: { type: String, required: [true, 'Material name is required'], trim: true },
  category: { 
    type: String, 
    required: [true, 'Category is required'], 
    enum: ['Raw Fabric', 'Yarn', 'Trims & Accessories', 'Dye & Chemicals', 'Packaging', 'Spare Parts', 'WIP', 'Finished Goods', 'Damaged & Rejected', 'Other'] 
  },
  quantity: { type: Number, required: [true, 'Quantity is required'], min: [0, 'Quantity cannot be negative'] },
  reservedQuantity: { type: Number, default: 0, min: 0 },
  unit: { type: String, required: [true, 'Unit is required'], enum: ['KG', 'Meter', 'Pieces', 'Yards', 'Roll', 'Box', 'Cone', 'Set', 'Liter'] },
  minStockLevel: { type: Number, default: 100 },
  unitPrice: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  warehouseLocation: { type: String, default: 'Main Warehouse' },
  supplier: { type: String, trim: true, default: 'General Supplier' },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  purchaseDate: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
