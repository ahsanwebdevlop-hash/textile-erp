import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  machineCode: { type: String, required: [true, 'Machine code is required'], trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Spinning Frame', 'Weaving Loom', 'Knitting Machine', 'Dyeing Vat', 'Cutting Machine', 'Sewing Machine', 'Printing Press', 'Embroidery Machine', 'Boiler / Generator', 'Finishing Press'], required: true },
  brand: { type: String, default: 'Juki / Rieter' },
  modelNumber: { type: String, default: '' },
  serialNumber: { type: String, default: '' },
  department: { type: String, default: 'Sewing Department' },
  locationLine: { type: String, default: 'Line-1' },
  purchaseDate: { type: Date },
  purchaseCost: { type: Number, default: 0 },
  operatingHours: { type: Number, default: 0 },
  status: { type: String, enum: ['Running', 'Idle', 'Downtime / Breakdown', 'Under Maintenance', 'Decommissioned'], default: 'Running' },
  lastMaintenanceDate: { type: Date },
  nextMaintenanceDue: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Machine = mongoose.model('Machine', machineSchema);
export default Machine;
