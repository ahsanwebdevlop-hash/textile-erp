import mongoose from 'mongoose';

const subcontractSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  jobOrderNumber: { type: String, required: [true, 'Job order number is required'], trim: true },
  vendorName: { type: String, required: [true, 'Vendor name is required'], trim: true },
  vendorContact: { type: String, default: '' },
  processType: { type: String, enum: ['Washing', 'Dyeing', 'Screen Printing', 'Embroidery', 'Pleating', 'Special Finishing', 'Other'], required: true },
  styleNumber: { type: String, default: '' },
  productionOrderRef: { type: String, default: '' },
  materialIssued: { type: String, required: true },
  issuedQuantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'Pieces' },
  unitProcessingCost: { type: Number, default: 0 },
  totalEstimatedCost: { type: Number, default: 0 },
  returnedQuantity: { type: Number, default: 0 },
  rejectedQuantity: { type: Number, default: 0 },
  issueDate: { type: Date, default: Date.now },
  expectedReturnDate: { type: Date },
  actualReturnDate: { type: Date },
  status: { type: String, enum: ['Material Issued', 'In Process', 'Partially Returned', 'Completed', 'Cancelled'], default: 'Material Issued' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Subcontract = mongoose.model('Subcontract', subcontractSchema);
export default Subcontract;
