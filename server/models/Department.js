import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Department name is required'], trim: true },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

departmentSchema.index({ organizationId: 1, name: 1 }, { unique: true });

const Department = mongoose.model('Department', departmentSchema);
export default Department;
