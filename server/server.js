import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import productionRoutes from './routes/productionRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import bomRoutes from './routes/bomRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import qualityRoutes from './routes/qualityRoutes.js';
import costingRoutes from './routes/costingRoutes.js';
import complianceRoutes from './routes/complianceRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import mrpRoutes from './routes/mrpRoutes.js';
import bundleRoutes from './routes/bundleRoutes.js';
import subcontractRoutes from './routes/subcontractRoutes.js';
import shadeRoutes from './routes/shadeRoutes.js';
import controlTowerRoutes from './routes/controlTowerRoutes.js';
import automationRoutes from './routes/automationRoutes.js';
import machineRoutes from './routes/machineRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import traceabilityRoutes from './routes/traceabilityRoutes.js';
import techPackSpecRoutes from './routes/techPackSpecRoutes.js';
import capacityPlanRoutes from './routes/capacityPlanRoutes.js';
import fabricQC4PointRoutes from './routes/fabricQC4PointRoutes.js';
import cutPlanRoutes from './routes/cutPlanRoutes.js';
import vendorRatingRoutes from './routes/vendorRatingRoutes.js';
import warehouseBinRoutes from './routes/warehouseBinRoutes.js';
import financialLedgerRoutes from './routes/financialLedgerRoutes.js';

dotenv.config();

// Connect to Database
connectDB().catch((error) => {
  console.error(`Initial database connection failed: ${error.message}`);
});

const app = express();

// CORS - Must be registered first
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Security
app.use(helmet());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));

// Health check should remain available while the database is reconnecting.
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TextileFlow API is running',
    version: '3.0.0'
  });
});

// Middleware to ensure database connection is ready for every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database middleware error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection timed out.'
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bom', bomRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/costing', costingRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/mrp', mrpRoutes);
app.use('/api/bundles', bundleRoutes);
app.use('/api/subcontracts', subcontractRoutes);
app.use('/api/shades', shadeRoutes);
app.use('/api/control-tower', controlTowerRoutes);
app.use('/api/automations', automationRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/traceability', traceabilityRoutes);
app.use('/api/tech-pack-specs', techPackSpecRoutes);
app.use('/api/capacity-plans', capacityPlanRoutes);
app.use('/api/fabric-qc-4point', fabricQC4PointRoutes);
app.use('/api/cut-plans', cutPlanRoutes);
app.use('/api/vendor-ratings', vendorRatingRoutes);
app.use('/api/warehouse-bins', warehouseBinRoutes);
app.use('/api/financial-ledgers', financialLedgerRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`TextileFlow v3 Server running on port ${PORT}`);
  });
}

export default app;