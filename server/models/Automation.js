import mongoose from 'mongoose';

const automationSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  automationKey: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['Inventory & MRP', 'Production & Quality', 'Sales & Shipping', 'Finance & Billing', 'Compliance & Reminders'], required: true },
  description: { type: String, required: true },
  enabled: { type: Boolean, default: false },
  config: { type: Object, default: {} },
  lastTriggeredAt: { type: Date },
  triggerCount: { type: Number, default: 0 }
}, { timestamps: true });

const Automation = mongoose.model('Automation', automationSchema);
export default Automation;
