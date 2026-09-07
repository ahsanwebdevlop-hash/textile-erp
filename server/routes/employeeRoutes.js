import express from 'express';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { body, query } from 'express-validator';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { protect, requireOrganization, adminOnly, managerOrAdmin } from '../middleware/auth.js';
import { getAll, getOne, updateOne, deleteOne } from '../controllers/baseController.js';

const router = express.Router();

router.use(protect, requireOrganization);

const sendEmployeeAccessEmail = async (user, rawToken, temporaryPassword) => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = new Error('Email verification is not configured');
    error.statusCode = 503;
    throw error;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${rawToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: user.email,
    subject: 'Your TextileFlow employee account',
    text: `Your TextileFlow account is ready. Temporary password: ${temporaryPassword}. Verify your email here: ${verifyUrl}`,
    html: `<p>Hello ${user.name},</p><p>Your TextileFlow account is ready.</p><p><strong>Temporary password:</strong> ${temporaryPassword}</p><p>Verify your email here: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
};

router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().escape(),
  query('department').optional().isIn(['Production', 'Quality Control', 'Warehouse', 'Design', 'Sales', 'Administration', 'Maintenance'])
], getAll(Employee, 'createdBy userId'));

router.get('/:id', protect, getOne(Employee, 'createdBy userId'));

router.post('/', protect, requireOrganization, adminOnly, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid employee email is required'),
  body('department').optional().isIn(['None']).withMessage('Department must be None until departments are configured'),
  body('role').isIn(['manager', 'employee']).withMessage('Role must be Manager or Employee'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('joiningDate').isISO8601().withMessage('Valid joining date is required')
], async (req, res, next) => {
  try {
    if (!req.organization) {
      return res.status(403).json({ success: false, message: 'An organization is required to create employees' });
    }
    const { name, email, department = 'None', role, phone, joiningDate } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const temporaryPassword = crypto.randomBytes(12).toString('base64url');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email,
      password: temporaryPassword,
      role,
      organizationId: req.organization._id,
      emailVerificationToken: crypto.createHash('sha256').update(rawToken).digest('hex'),
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    let employee;
    try {
      employee = await Employee.create({
        name,
        department,
        role,
        phone,
        joiningDate,
        organizationId: req.organization._id,
        userId: user._id,
        createdBy: req.user._id,
      });
      await sendEmployeeAccessEmail(user, rawToken, temporaryPassword);
    } catch (creationError) {
      if (employee?._id) await Employee.deleteOne({ _id: employee._id });
      await User.deleteOne({ _id: user._id });
      throw creationError;
    }

    const responseEmployee = await Employee.findById(employee._id).populate('userId', 'name email role isEmailVerified');
    res.status(201).json({
      success: true,
      message: 'Employee account created. Verification instructions were sent by email.',
      data: responseEmployee,
    });
  } catch (error) { next(error); }
});

router.put('/:id', protect, managerOrAdmin, updateOne(Employee));
router.delete('/:id', protect, managerOrAdmin, deleteOne(Employee));

export default router;