import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
    const secret = process.env.JWT_SECRET || 'a7dcaf7293f0f1ddb649fbf0d75845c1b688c8ba5990a702e8e3c5c39dada0942f941963e5ab2a2d55dd12382e2f9f9e1bb2965b36cd864ddb4dbfa445339ec6';
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.id).populate('company').select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    // super_admin & admin always pass
    if (['super_admin', 'admin'].includes(req.user.role)) {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not authorized to access this resource` });
    }
    next();
  };
};

export const checkPermission = (moduleName, action = 'view') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    // Admin & super_admin have full permission across all modules and actions
    if (['super_admin', 'admin'].includes(req.user.role)) {
      return next();
    }

    // Role-based action matrix
    const rolePermissions = {
      manager: ['view', 'create', 'edit', 'approve', 'export'],
      employee: ['view', 'create'],
      operator: ['view']
    };

    const allowedActions = rolePermissions[req.user.role] || ['view'];
    if (!allowedActions.includes(action)) {
      return res.status(403).json({
        success: false,
        message: `Action '${action}' on module '${moduleName}' is not allowed for role '${req.user.role}'`
      });
    }

    next();
  };
};

export const adminOnly = authorize('admin', 'super_admin');
export const managerOrAdmin = authorize('admin', 'super_admin', 'manager', 'production_manager', 'inventory_manager', 'accounts_manager', 'purchase_manager', 'sales_manager', 'quality_manager');
