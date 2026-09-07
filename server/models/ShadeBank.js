import mongoose from 'mongoose';

const shadeBankSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  shadeCode: { type: String, required: [true, 'Shade code is required'], trim: true },
  shadeName: { type: String, required: true, trim: true },
  colorFamily: { type: String, default: 'Navy Blue' },
  buyerName: { type: String, default: '' },
  dyeLotNumber: { type: String, default: '' },
  approvalStatus: { type: String, enum: ['Pending Approval', 'Approved', 'Rejected', 'Conditional'], default: 'Approved' },
  pantoneReference: { type: String, default: '' },
  labDipNumber: { type: String, default: '' },
  deltaEValue: { type: Number, default: 0.5 }, // Color tolerance
  swatchImage: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const ShadeBank = mongoose.model('ShadeBank', shadeBankSchema);
export default ShadeBank;
