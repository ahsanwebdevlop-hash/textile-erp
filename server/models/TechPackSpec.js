import mongoose from 'mongoose';

const techPackSpecSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    styleNumber: { type: String, required: true },
    styleName: { type: String, required: true },
    buyerName: { type: String, required: true },
    garmentCategory: { type: String, default: 'Tops' },
    sampleStage: { 
      type: String, 
      enum: ['Proto Sample', 'Fit Sample', 'Salesman Sample', 'PP Sample', 'TOP Sample'], 
      default: 'Proto Sample' 
    },
    sampleStatus: { 
      type: String, 
      enum: ['Pending Submission', 'Submitted', 'Approved', 'Rejected', 'Revise & Resubmit'], 
      default: 'Pending Submission' 
    },
    measurements: [
      {
        pointOfMeasure: { type: String, required: true }, // e.g., Chest Width, HPS Length, Sleeve Length
        tolerancePlusMinus: { type: String, default: '0.5 cm' },
        sizeS: { type: Number, default: 0 },
        sizeM: { type: Number, default: 0 },
        sizeL: { type: Number, default: 0 },
        sizeXL: { type: Number, default: 0 },
        size2XL: { type: Number, default: 0 }
      }
    ],
    comments: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('TechPackSpec', techPackSpecSchema);
