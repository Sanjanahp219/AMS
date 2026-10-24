import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    academyName: {
      type: String,
      default: 'AMS Academy',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Simplifying Academy Management',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'contact@amsacademy.edu',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
      trim: true,
    },
    address: {
      type: String,
      default: '100 Knowledge Boulevard, Tech Hub',
      trim: true,
    },
    city: {
      type: String,
      default: 'Bangalore',
      trim: true,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
      trim: true,
    },
  },
  { timestamps: true }
);

export const AcademySettings = mongoose.model('AcademySettings', settingsSchema);
