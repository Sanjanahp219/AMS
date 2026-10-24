import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/user.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to create JWT token
const createToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET || 'amsSecretKey2026',
    { expiresIn: '7d' }
  );
};

// 1. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // If MongoDB Atlas is not yet connected (e.g. IP whitelist pending), provide seamless fallback for demo credentials
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      console.log('⚠️ Notice: MongoDB Atlas IP whitelist pending. Using fallback credentials check.');

      // Check standard demo accounts
      if (cleanEmail === 'admin@ams.edu' && password === 'admin123') {
        const demoAdmin = {
          id: 'admin_demo_01',
          name: 'Academy Administrator',
          email: 'admin@ams.edu',
          role: 'Admin',
        };
        const token = createToken(demoAdmin);
        return res.json({
          message: 'Logged in successfully (Demo Session)',
          token,
          user: demoAdmin,
        });
      }

      if (cleanEmail === 'staff@ams.edu' && password === 'staff123') {
        const demoStaff = {
          id: 'staff_demo_02',
          name: 'Admissions Coordinator',
          email: 'staff@ams.edu',
          role: 'Staff',
        };
        const token = createToken(demoStaff);
        return res.json({
          message: 'Logged in successfully (Demo Session)',
          token,
          user: demoStaff,
        });
      }

      return res.status(503).json({
        message: 'MongoDB Atlas is not connected yet. Please whitelist your IP in Atlas Network Access or use demo accounts (admin@ams.edu / admin123).',
      });
    }

    // Normal MongoDB Atlas flow
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ message: 'Your account is deactivated. Contact an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken(user);

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    if (!isDbConnected) {
      return res.status(503).json({
        message: 'Cannot register until MongoDB Atlas connects. Please whitelist your IP in MongoDB Atlas -> Network Access.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'Staff',
      phone: phone || '',
    });

    const token = createToken(newUser);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. GET CURRENT USER PROFILE (/me)
router.get('/me', requireAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
