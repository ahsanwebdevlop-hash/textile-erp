import mongoose from 'mongoose';

const sparePartUsageSchema = new mongoose.Schema({
  partName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 }
});

const maintenanceOrderSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  workOrderNumber: { type: String, required: [true, 'Work order number is required'], trim: true },
  machineCode: { type: String, required: true },
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' },
  type: { type: String, enum: ['Preventive Maintenance', 'Corrective Repair', 'Emergency Breakdown', 'Calibration'], required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  issueDescription: { type: String, required: true },
  technicianName: { type: String, default: 'Maintenance Team' },
  downtimeHours: { type: Number, default: 0 },
  sparePartsUsed: [sparePartUsageSchema],
  totalRepairCost: { type: Number, default: 0 },
  status: { type: String, enum: ['Open / Requested', 'In Progress', 'Testing', 'Completed', 'Cancelled'], default: 'Open / Requested' },
  completedDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const MaintenanceOrder = mongoose.model('MaintenanceOrder', maintenanceOrderSchema);
export default MaintenanceOrder;
