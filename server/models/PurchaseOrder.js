import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema({
  materialName: { type: String, required: true },
  category: { type: String, enum: ['Yarn', 'Fabric', 'Dye Chemical', 'Trim', 'Packaging', 'Spare Parts', 'General'], default: 'Fabric' },
  quantity: { type: Number, required: true, min: 0.1 },
  unit: { type: String, required: true, default: 'KG' },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  receivedQty: { type: Number, default: 0 }
});

const purchaseOrderSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  poNumber: { type: String, required: [true, 'PO Number is required'], trim: true },
  supplier: { type: String, required: [true, 'Supplier is required'], trim: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  salesOrderRef: { type: String, default: '' },
  items: [purchaseItemSchema],
  totalAmount: { type: Number, required: [true, 'Total amount is required'], min: 0 },
  workflowStage: { 
    type: String, 
    enum: ['Purchase Request', 'Approved PO', 'Goods Received', 'Quality Checked', 'Invoiced', 'Paid', 'Cancelled'], 
    default: 'Purchase Request' 
  },
  status: { type: String, enum: ['Pending', 'Approved', 'Partially Received', 'Completed', 'Cancelled'], default: 'Pending' },
  purchaseDate: { type: Date, default: Date.now },
  expectedDeliveryDate: { type: Date },
  receivedDate: { type: Date },
  supplierInvoiceNumber: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
export default PurchaseOrder;