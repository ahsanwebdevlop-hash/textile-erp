import mongoose from 'mongoose';

const shipmentItemSchema = new mongoose.Schema({
  salesOrderRef: { type: String, required: true },
  buyerPO: { type: String, default: '' },
  styleNumber: { type: String, required: true },
  shippedQuantity: { type: Number, required: true, min: 1 },
  cartonCount: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 }
});

const shipmentSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  shipmentNumber: { type: String, required: [true, 'Shipment number is required'], trim: true },
  customerName: { type: String, required: true, trim: true },
  destinationCountry: { type: String, default: 'USA' },
  portOfLoading: { type: String, default: 'Karachi Port / Chittagong' },
  portOfDischarge: { type: String, default: 'Port of New York / Hamburg' },
  containerNumber: { type: String, default: '' },
  sealNumber: { type: String, default: '' },
  vesselName: { type: String, default: '' },
  shippingLine: { type: String, default: 'Maersk / MSC' },
  freightForwarder: { type: String, default: '' },
  incoterms: { type: String, enum: ['FOB', 'CIF', 'CFR', 'DDP', 'EXW'], default: 'FOB' },
  items: [shipmentItemSchema],
  totalQuantity: { type: Number, required: true },
  totalCartons: { type: Number, default: 0 },
  totalGrossWeightKg: { type: Number, default: 0 },
  totalNetWeightKg: { type: Number, default: 0 },
  totalCBM: { type: Number, default: 0 },
  totalShipmentValue: { type: Number, required: true },
  etdDate: { type: Date },
  etaDate: { type: Date },
  status: { type: String, enum: ['Planned', 'Booking Created', 'Packed', 'Customs Cleared', 'On Board', 'Delivered', 'Cancelled'], default: 'Planned' },
  commercialInvoiceNumber: { type: String, default: '' },
  lcNumber: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Shipment = mongoose.model('Shipment', shipmentSchema);
export default Shipment;
