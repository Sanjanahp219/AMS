import express from 'express';
import { AcademySettings } from '../models/settings.js';

const router = express.Router();

// 1. GET ACADEMY SETTINGS
router.get('/', async (req, res) => {
  try {
    let settings = await AcademySettings.findOne();
    if (!settings) {
      settings = await AcademySettings.create({
        academyName: 'AMS Academy',
        tagline: 'Simplifying Academy Management',
        contactEmail: 'admin@ams.edu',
        contactPhone: '+91 98765 43210',
        address: '100 Knowledge Boulevard, Tech Hub',
        city: 'Bangalore',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. UPDATE ACADEMY SETTINGS
router.put('/', async (req, res) => {
  try {
    let settings = await AcademySettings.findOne();
    if (!settings) {
      settings = new AcademySettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    const updated = await settings.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
