import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  companyName: { type: String, required: [true, 'Company name is required'], trim: true },
  description: { type: String, trim: true },
  industry: { type: String, trim: true },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  website: { type: String, trim: true },
  currency: { type: String, default: 'USD', trim: true },
  timezone: { type: String, default: 'UTC', trim: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
