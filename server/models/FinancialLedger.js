import mongoose from 'mongoose';

const financialLedgerSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    voucherNumber: { type: String, required: true },
    accountType: { type: String, enum: ['Revenue / Export Sales', 'Raw Material Expense', 'Direct Labor Payroll', 'Factory Overhead', 'Logistics & Freight', 'Other'], required: true },
    transactionType: { type: String, enum: ['Debit', 'Credit'], required: true },
    currency: { type: String, enum: ['USD', 'EUR', 'GBP', 'BDT', 'PKR', 'INR', 'TRY', 'RMB'], default: 'USD' },
    amountOriginal: { type: Number, required: true },
    exchangeRateToUSD: { type: Number, default: 1.0 },
    amountInUSD: { type: Number, required: true },
    partyName: { type: String, required: true }, // Customer or Supplier Name
    referenceDocNumber: { type: String }, // Invoice # or PO #
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('FinancialLedger', financialLedgerSchema);
