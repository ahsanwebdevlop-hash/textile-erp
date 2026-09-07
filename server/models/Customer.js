import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  name: { type: String, required: [true, 'Customer/Buyer name is required'], trim: true },
  code: { type: String, trim: true, uppercase: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  country: { type: String, default: 'USA' },
  address: { type: String, trim: true },
  contactPerson: { type: String, trim: true },
  paymentTerms: { type: String, default: 'Net 30' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
