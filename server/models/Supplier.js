import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  companyName: { type: String, required: [true, 'Company name is required'], trim: true },
  contactPerson: { type: String, required: [true, 'Contact person is required'], trim: true },
  phone: { type: String, required: [true, 'Phone is required'], trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true },
  category: { type: String, enum: ['Yarn Supplier', 'Fabric Mill', 'Dyeing & Chemical', 'Trims & Accessories', 'Packaging', 'General'], default: 'Fabric Mill' },
  rating: { type: Number, default: 4.5, min: 1, max: 5 },
  leadTimeDays: { type: Number, default: 14 },
  outstandingBalance: { type: Number, default: 0 },
  paymentTerms: { type: String, default: 'Net 30' },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Paid' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', supplierSchema);
export default Supplier;