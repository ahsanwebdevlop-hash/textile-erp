import mongoose from 'mongoose';

const vendorRatingSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    vendorName: { type: String, required: true },
    category: { type: String, enum: ['Yarn Supplier', 'Fabric Mill', 'Dye Chemical', 'Trims & Accessories', 'Packaging'], default: 'Fabric Mill' },
    onTimeDeliveryPercent: { type: Number, default: 95 },
    qualityAcceptancePercent: { type: Number, default: 98 },
    priceCompetivenessRating: { type: Number, default: 4.5 }, // 1 to 5 stars
    totalOrdersFulfilled: { type: Number, default: 12 },
    debitNotesIssuedCount: { type: Number, default: 0 },
    overallScore: { type: Number, default: 92 }, // out of 100
    grade: { type: String, enum: ['Preferred (A+)', 'Approved (A)', 'Conditional (B)', 'Blacklisted (C)'], default: 'Approved (A)' },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('VendorRating', vendorRatingSchema);
