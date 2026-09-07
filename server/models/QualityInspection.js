import mongoose from 'mongoose';

const defectItemSchema = new mongoose.Schema({
  defectType: { type: String, required: true },
  category: { type: String, enum: ['Fabric Defect', 'Sewing Defect', 'Finishing Defect', 'Shade Variation', 'Measurement Defect', 'Other'], default: 'Sewing Defect' },
  severity: { type: String, enum: ['Minor', 'Major', 'Critical'], required: true },
  defectCount: { type: Number, required: true, min: 1 },
  actionRequired: { type: String, default: 'Rework' }
});

const qualityInspectionSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  inspectionNumber: { type: String, required: [true, 'Inspection number is required'], trim: true },
  inspectionType: { type: String, enum: ['4-Point Fabric Inspection', 'Garment AQL 2.5', 'In-Line Sewing Audit', 'Pre-Shipment Audit'], required: true },
  productionOrderRef: { type: String, trim: true, default: '' },
  batchLotRef: { type: String, trim: true, default: '' },
  inspectedQuantity: { type: Number, required: true, min: 1 },
  sampleSize: { type: Number, required: true, min: 1 },
  rejectedQuantity: { type: Number, default: 0, min: 0 },
  reworkQuantity: { type: Number, default: 0, min: 0 },
  totalDefects: { type: Number, default: 0 },
  aqlLevel: { type: String, default: 'AQL 2.5 Normal' },
  status: { type: String, enum: ['PASSED', 'FAILED', 'CONDITIONAL_ACCEPTANCE', 'UNDER_REWORK'], default: 'PASSED' },
  defects: [defectItemSchema],
  inspectorName: { type: String, required: true },
  correctiveAction: { type: String, default: '' },
  remarks: { type: String, trim: true },
  approvedBy: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const QualityInspection = mongoose.model('QualityInspection', qualityInspectionSchema);
export default QualityInspection;
