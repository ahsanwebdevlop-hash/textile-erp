import AuditLog from '../models/AuditLog.js';

const logAudit = async (req, action, moduleName, docId, details = {}) => {
  try {
    if (req.user) {
      await AuditLog.create({
        company: req.user.company?._id || req.user.company,
        user: req.user._id,
        userName: req.user.name || req.user.email,
        action,
        module: moduleName,
        documentId: docId ? String(docId) : undefined,
        details,
        ipAddress: req.ip
      });
    }
  } catch (err) {
    console.error('Audit logging failed:', err.message);
  }
};

export const createOne = (Model, moduleName = 'General') => async (req, res, next) => {
  try {
    const payload = { ...req.body, createdBy: req.user?._id };
    if (req.user?.company && Model.schema.paths.company) {
      payload.company = req.user.company._id || req.user.company;
    }
    const doc = await Model.create(payload);
    await logAudit(req, 'CREATE', moduleName, doc._id, { title: doc.name || doc.code || doc.styleNumber || doc.poNumber });
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const getAll = (Model, populateOptions = '', moduleName = 'General') => async (req, res, next) => {
  try {
    const { page = 1, limit = 100, search = '', sortBy = 'createdAt', sortOrder = 'desc', ...filters } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
    let query = {};
    if (req.user?.company && Model.schema.paths.company) {
      query.company = req.user.company._id || req.user.company;
    }

    // Apply search
    if (search && Model.schema.paths) {
      const searchableFields = Object.keys(Model.schema.paths).filter(f => 
        Model.schema.paths[f].instance === 'String' && f !== '_id' && f !== 'password'
      );
      if (searchableFields.length > 0) {
        query.$or = searchableFields.map(field => ({
          [field]: { $regex: search, $options: 'i' }
        }));
      }
    }
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        if (key === 'startDate' || key === 'endDate') {
          if (!query.createdAt && !query.date) query.createdAt = {};
          const target = query.createdAt || query.date;
          if (key === 'startDate') target.$gte = new Date(filters[key]);
          if (key === 'endDate') target.$lte = new Date(filters[key]);
        } else if (key === 'minAmount' || key === 'maxAmount') {
          if (!query.amount && !query.totalCost && !query.totalAmount) query.totalAmount = {};
          const target = query.totalAmount || query.totalCost || query.amount;
          if (key === 'minAmount') target.$gte = Number(filters[key]);
          if (key === 'maxAmount') target.$lte = Number(filters[key]);
        } else if (Model.schema.paths[key]) {
          query[key] = filters[key];
        }
      }
    });
    
    const [docs, total] = await Promise.all([
      Model.find(query).populate(populateOptions).sort(sort).skip(skip).limit(Number(limit)),
      Model.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      count: docs.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: docs
    });
  } catch (error) { next(error); }
};

export const getOne = (Model, populateOptions = '', moduleName = 'General') => async (req, res, next) => {
  try {
    let query = { _id: req.params.id };
    if (req.user?.company && Model.schema.paths.company) {
      query.company = req.user.company._id || req.user.company;
    }
    const doc = await Model.findOne(query).populate(populateOptions);
    if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateOne = (Model, moduleName = 'General') => async (req, res, next) => {
  try {
    let query = { _id: req.params.id };
    if (req.user?.company && Model.schema.paths.company) {
      query.company = req.user.company._id || req.user.company;
    }
    const doc = await Model.findOneAndUpdate(query, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });
    await logAudit(req, 'UPDATE', moduleName, doc._id, { changes: Object.keys(req.body) });
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteOne = (Model, moduleName = 'General') => async (req, res, next) => {
  try {
    let query = { _id: req.params.id };
    if (req.user?.company && Model.schema.paths.company) {
      query.company = req.user.company._id || req.user.company;
    }
    const doc = await Model.findOneAndDelete(query);
    if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });
    await logAudit(req, 'DELETE', moduleName, req.params.id);
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) { next(error); }
};