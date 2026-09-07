import mongoose from 'mongoose';

const cutPlanSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    cutPlanNumber: { type: String, required: true },
    styleNumber: { type: String, required: true },
    fabricName: { type: String, required: true },
    totalOrderPcs: { type: Number, required: true },
    plannedPliesCount: { type: Number, required: true },
    markerLengthMeters: { type: Number, required: true },
    markerEfficiencyPercent: { type: Number, required: true }, // e.g. 84.5%
    sizeRatio: {
      sizeS: { type: Number, default: 1 },
      sizeM: { type: Number, default: 2 },
      sizeL: { type: Number, default: 2 },
      sizeXL: { type: Number, default: 1 }
    },
    totalCutPcs: { type: Number, required: true },
    fabricConsumedKg: { type: Number, required: true },
    status: { type: String, enum: ['Draft', 'In Cutting', 'Completed'], default: 'Draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('CutPlan', cutPlanSchema);
