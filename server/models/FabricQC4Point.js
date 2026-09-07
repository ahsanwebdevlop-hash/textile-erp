import mongoose from 'mongoose';

const fabricQC4PointSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    inspectionNumber: { type: String, required: true },
    rollNumber: { type: String, required: true },
    lotNumber: { type: String, required: true },
    fabricName: { type: String, required: true },
    supplierName: { type: String, required: true },
    rollWidthInches: { type: Number, required: true },
    rollLengthYards: { type: Number, required: true },
    totalDefectPoints: { type: Number, default: 0 },
    pointsPer100SqYards: { type: Number, default: 0 },
    gradeVerdict: { type: String, enum: ['Grade A', 'Grade B', 'Grade C', 'Rejected'], default: 'Grade A' },
    defectsLog: [
      {
        defectName: { type: String, required: true }, // Hole, Slub, Stain, Color Variation
        sizeCategory: { type: String, enum: ['1 pt (<3")', '2 pt (3-6")', '3 pt (6-9")', '4 pt (>9" or Hole)'], required: true },
        points: { type: Number, required: true },
        locationYardage: { type: Number, default: 0 }
      }
    ],
    inspectorName: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('FabricQC4Point', fabricQC4PointSchema);
