import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'a7dcaf7293f0f1ddb649fbf0d75845c1b688cba5990a702e8e3c5c39dada0942f941963e5ab2a2d55dd12382e2f9f9e1bb2965b36cd864ddb4dbfa445339ec6';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (req.user.status && req.user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'User account is suspended' });
    }
    req.organization = req.user.organizationId
      ? await Organization.findById(req.user.organizationId)
      : null;
    if (req.user.organizationId && !req.organization) {
      return res.status(401).json({ success: false, message: 'Organization not found' });
    }
    if (req.organization && req.organization.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Organization is inactive' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const requireOrganization = (req, res, next) => {
  if (!req.organization) {
    return res.status(403).json({ success: false, message: 'An active organization context is required' });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized as admin' });
  }
};

export const managerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
};
