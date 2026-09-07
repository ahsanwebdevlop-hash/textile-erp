import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Company name is required'], trim: true },
  code: { type: String, uppercase: true, trim: true, default: 'TF' },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  taxId: { type: String, trim: true },
  currency: { type: String, default: 'USD' },
  logo: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
export default Company;
