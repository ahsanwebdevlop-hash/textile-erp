import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const getJwtSecret = () => process.env.JWT_SECRET || 'a7dcaf7293f0f1ddb649fbf0d75845c1b688cba5990a702e8e3c5c39dada0942f941963e5ab2a2d55dd12382e2f9f9e1bb2965b36cd864ddb4dbfa445339ec6';
const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), { expiresIn: '30d' });

const getOrganizationData = (organization) => organization ? {
  _id: organization._id,
  companyName: organization.companyName,
  description: organization.description,
  industry: organization.industry,
  address: organization.address,
  phone: organization.phone,
  website: organization.website,
  currency: organization.currency,
  timezone: organization.timezone,
  status: organization.status,
} : null;

const assertEmailConfiguration = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = new Error('Email verification is not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS, and EMAIL_FROM in server/.env');
    error.statusCode = 503;
    throw error;
  }
};

const sendVerificationEmail = async (user, rawToken) => {
  assertEmailConfiguration();
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
    subject: 'Verify your TextileFlow account',
    text: `Hello ${user.name}, verify your TextileFlow account here: ${verifyUrl}`,
    html: `<p>Hello ${user.name},</p><p>Verify your TextileFlow account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
};

router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('companyName').trim().notEmpty().withMessage('Company or mill name is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }
      const { name, email, password, companyName, description, industry, address, phone, website, currency, timezone } = req.body;
      assertEmailConfiguration();
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
      const organization = await Organization.create({
        companyName,
        description,
        industry,
        address,
        phone,
        website,
        currency,
        timezone,
      });
      const rawToken = crypto.randomBytes(32).toString('hex');
      let user;
      try {
        user = await User.create({
          name,
          email,
          password,
          role: 'admin',
          organizationId: organization._id,
          emailVerificationToken: crypto.createHash('sha256').update(rawToken).digest('hex'),
          emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
        });
        await sendVerificationEmail(user, rawToken);
        organization.createdBy = user._id;
        await organization.save();
        return res.status(201).json({
          success: true,
          message: 'Workspace created. Check your email to verify your admin account before signing in.',
          data: { organization: getOrganizationData(organization) },
        });
      } catch (emailError) {
        if (user?._id) await User.deleteOne({ _id: user._id });
        await Organization.deleteOne({ _id: organization._id });
        throw emailError;
      }
    } catch (error) { next(error); }
  }
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      if (user.status && user.status !== 'active') {
        return res.status(403).json({ success: false, message: 'User account is suspended' });
      }
      if (!user.isEmailVerified) {
        return res.status(403).json({ success: false, message: 'Please verify your email before signing in' });
      }
      const organization = user.organizationId ? await Organization.findById(user.organizationId) : null;
      if (organization && organization.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Organization is inactive' });
      }
      res.json({
        success: true,
        data: { _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status || 'active', organization: getOrganizationData(organization), token: generateToken(user) },
      });
    } catch (error) { next(error); }
  }
);

router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');
    if (!user) return res.status(400).json({ success: false, message: 'Verification link is invalid or expired' });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    res.json({ success: true, message: 'Email verified successfully. You can now sign in.' });
  } catch (error) { next(error); }
});

router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status || 'active',
        organization: getOrganizationData(req.organization),
      },
    });
  } catch (error) { next(error); }
});

export default router;
