import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  transactionNumber: { type: String, trim: true },
  type: { type: String, required: [true, 'Type is required'], enum: ['Income', 'Expense', 'Accounts Payable', 'Accounts Receivable'] },
  title: { type: String, required: [true, 'Title is required'], trim: true },
  amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
  category: { type: String, required: [true, 'Category is required'], enum: ['Sales Income', 'Raw Material Purchase', 'Dyeing & Finishing', 'Labor & Wages', 'Utilities & Freight', 'Equipment Maintenance', 'Office Overhead', 'Other'], default: 'Sales Income' },
  paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Letter of Credit (LC)', 'Cheque'], default: 'Bank Transfer' },
  referenceInvoice: { type: String, default: '' },
  partyName: { type: String, default: '' }, // Customer or Supplier Name
  date: { type: Date, default: Date.now },
  description: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;