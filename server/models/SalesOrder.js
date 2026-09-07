import mongoose from 'mongoose';

const salesOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: [true, 'Order number is required'], trim: true },
  customerName: { type: String, required: [true, 'Customer name is required'], trim: true },
  productName: { type: String, required: [true, 'Product name is required'], trim: true },
  quantity: { type: Number, required: [true, 'Quantity is required'], min: 1 },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  totalAmount: { type: Number, required: [true, 'Total amount is required'], min: 0 },
  deliveryDate: { type: Date, required: [true, 'Delivery date is required'] },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Production Started', 'Completed', 'Delivered'], default: 'Pending' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

salesOrderSchema.index({ organizationId: 1, orderNumber: 1 }, { unique: true });

const SalesOrder = mongoose.model('SalesOrder', salesOrderSchema);
export default SalesOrder;