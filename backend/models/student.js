import mongoose from 'mongoose';

// Concurrency-safe counter for Student IDs (e.g. STU-2026-0001)
const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    dateOfBirth: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    emergencyContact: {
      type: String,
      default: '',
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Archived'],
      default: 'Active',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Auto-generate studentId if not provided before saving
studentSchema.pre('save', async function () {
  if (!this.studentId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Student').countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    this.studentId = `STU-${year}-${sequence}`;
  }
});

export const Student = mongoose.model('Student', studentSchema);
