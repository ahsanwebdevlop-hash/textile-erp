import mongoose from 'mongoose';

const requireOrganizationId = (req) => {
  if (!req.organization?._id) {
    const error = new Error('An active organization context is required');
    error.statusCode = 403;
    throw error;
  }
  return req.organization._id;
};

export const createOne = (Model) => async (req, res, next) => {
  try {
    const organizationId = requireOrganizationId(req);
    const { organizationId: ignoredOrganizationId, ...body } = req.body;
    const doc = await Model.create({ ...body, organizationId, createdBy: req.user._id });
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const getAll = (Model, populateOptions = '') => async (req, res, next) => {
  try {
    const organizationId = requireOrganizationId(req);
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc', ...filters } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
    let query = { organizationId };
    
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
      if (key === 'organizationId') return;
      if (filters[key] && filters[key] !== 'all') {
        if (key === 'startDate' || key === 'endDate') {
          if (!query.date) query.date = {};
          if (key === 'startDate') query.date.$gte = new Date(filters[key]);
          if (key === 'endDate') query.date.$lte = new Date(filters[key]);
        } else if (key === 'minAmount' || key === 'maxAmount') {
          if (!query.amount) query.amount = {};
          if (key === 'minAmount') query.amount.$gte = Number(filters[key]);
          if (key === 'maxAmount') query.amount.$lte = Number(filters[key]);
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

export const getOne = (Model, populateOptions = '') => async (req, res, next) => {
  try {
    const organizationId = requireOrganizationId(req);
    const doc = await Model.findOne({ _id: req.params.id, organizationId }).populate(populateOptions);
    if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const updateOne = (Model) => async (req, res, next) => {
  try {
    const organizationId = requireOrganizationId(req);
    const { organizationId: ignoredOrganizationId, createdBy: ignoredCreatedBy, ...body } = req.body;
    const doc = await Model.findOneAndUpdate(
      { _id: req.params.id, organizationId },
      body,
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
};

export const deleteOne = (Model) => async (req, res, next) => {
  try {
    const organizationId = requireOrganizationId(req);
    const doc = await Model.findOneAndDelete({ _id: req.params.id, organizationId });
    if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) { next(error); }
};