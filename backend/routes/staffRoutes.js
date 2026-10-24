import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. GET ALL STAFF ACCOUNTS (Admin only)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const staffMembers = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(staffMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. CREATE NEW STAFF ACCOUNT
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
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
      status: 'Active',
    });

    res.status(201).json({
      message: 'Staff account created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        status: newUser.status,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3. UPDATE STAFF ROLE OR DETAILS
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, role, phone, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Staff account not found' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (status) user.status = status;

    await user.save();

    res.json({
      message: 'Staff account updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. RESET STAFF PASSWORD
router.post('/:id/reset-password', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Staff account not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: `Password reset successfully for ${user.name}` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
