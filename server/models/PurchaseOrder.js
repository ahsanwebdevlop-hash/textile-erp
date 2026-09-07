import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema({
  materialName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
});

const purchaseOrderSchema = new mongoose.Schema({
  purchaseNumber: { type: String, required: [true, 'Purchase number is required'], trim: true },
  supplier: { type: String, required: [true, 'Supplier is required'], trim: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  items: [purchaseItemSchema],
  totalAmount: { type: Number, required: [true, 'Total amount is required'], min: 0 },
  status: { type: String, enum: ['Pending', 'Approved', 'Received', 'Cancelled'], default: 'Pending' },
  purchaseDate: { type: Date, required: [true, 'Purchase date is required'] },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

purchaseOrderSchema.index({ organizationId: 1, purchaseNumber: 1 }, { unique: true });

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
export default PurchaseOrder;