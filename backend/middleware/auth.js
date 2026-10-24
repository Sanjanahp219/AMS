import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

// Middleware to verify JWT token
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'amsSecretKey2026');

    // Attach basic user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
};

// Middleware to enforce Administrator role
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
};
