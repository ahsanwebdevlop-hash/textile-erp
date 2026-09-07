import mongoose from 'mongoose';

const sizeColorBreakdownSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size: { type: String, required: true }, // e.g. S, M, L, XL, XXL
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
});

const salesOrderSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  orderNumber: { type: String, required: [true, 'Order number is required'], trim: true },
  buyerPO: { type: String, trim: true, default: '' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, required: [true, 'Customer name is required'], trim: true },
  styleNumber: { type: String, default: '' },
  productName: { type: String, required: [true, 'Product name is required'], trim: true },
  garmentType: { type: String, default: 'T-Shirt' },
  quantity: { type: Number, required: [true, 'Quantity is required'], min: 1 },
  unitPrice: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: [true, 'Total amount is required'], min: 0 },
  deliveryDate: { type: Date, required: [true, 'Delivery date is required'] },
  paymentTerms: { type: String, default: 'LC / Wire Transfer' },
  breakdown: [sizeColorBreakdownSchema],
  orderStatus: { type: String, enum: ['Pending', 'Confirmed', 'In Production', 'Quality Audit', 'Packed', 'Shipped', 'Completed', 'Cancelled'], default: 'Pending' },
  productionStatus: { type: String, enum: ['Not Started', 'Cutting', 'Sewing', 'Finishing', 'Completed'], default: 'Not Started' },
  shipmentStatus: { type: String, enum: ['Pending', 'Booking Created', 'Customs Cleared', 'On Board', 'Delivered'], default: 'Pending' },
  packingList: {
    cartonCount: { type: Number, default: 0 },
    grossWeightKg: { type: Number, default: 0 },
    netWeightKg: { type: Number, default: 0 },
    cbm: { type: Number, default: 0 }
  },
  commercialInvoice: {
    invoiceNumber: { type: String, default: '' },
    invoiceDate: { type: Date },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const SalesOrder = mongoose.model('SalesOrder', salesOrderSchema);
export default SalesOrder;