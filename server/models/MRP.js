import mongoose from 'mongoose';

const mrpSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    mrpNumber: { type: String, required: true },
    salesOrderId: { type: String, required: true },
    styleNumber: { type: String, required: true },
    orderQuantity: { type: Number, required: true },
    status: { type: String, enum: ['Draft', 'Calculated', 'PO Generated', 'Completed'], default: 'Calculated' },
    items: [
      {
        materialName: { type: String, required: true },
        category: { type: String, default: 'Yarn' },
        requiredQuantity: { type: Number, required: true },
        availableQuantity: { type: Number, default: 0 },
        shortageQuantity: { type: Number, required: true },
        unit: { type: String, default: 'KG' },
        unitCost: { type: Number, default: 0 },
        estimatedCost: { type: Number, default: 0 },
        poStatus: { type: String, enum: ['Pending', 'PO Created'], default: 'Pending' }
      }
    ],
    totalEstimatedCost: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('MRP', mrpSchema);
