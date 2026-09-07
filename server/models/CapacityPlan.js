import mongoose from 'mongoose';

const capacityPlanSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    lineName: { type: String, required: true },
    styleNumber: { type: String, required: true },
    buyerName: { type: String, required: true },
    orderQuantity: { type: Number, required: true },
    smv: { type: Number, required: true }, // Standard Minute Value / SAM
    operatorsCount: { type: Number, default: 20 },
    helpersCount: { type: Number, default: 2 },
    targetEfficiency: { type: Number, default: 75 }, // percentage
    dailyTargetPcs: { type: Number, required: true },
    startDate: { type: Date, required: true },
    completionDate: { type: Date, required: true },
    status: { type: String, enum: ['Scheduled', 'Running', 'Completed', 'Delayed'], default: 'Scheduled' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('CapacityPlan', capacityPlanSchema);
