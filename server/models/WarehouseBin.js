import mongoose from 'mongoose';

const warehouseBinSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    warehouseName: { type: String, required: true }, // e.g. Yarn Store, Fabric Roll Warehouse, Accessories Store
    zone: { type: String, required: true }, // e.g. Zone A, Raw Cotton Bay
    rackCode: { type: String, required: true }, // e.g. Rack-04
    binCode: { type: String, required: true }, // e.g. Bin A-02-04
    capacityKgOrUnits: { type: Number, default: 500 },
    currentStockKgOrUnits: { type: Number, default: 0 },
    storedMaterialName: { type: String },
    status: { type: String, enum: ['Available', 'Occupied', 'Full', 'Maintenance'], default: 'Available' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('WarehouseBin', warehouseBinSchema);
