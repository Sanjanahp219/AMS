import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      required: [true, 'Course duration is required'],
      min: 1,
    },
    durationUnit: {
      type: String,
      enum: ['Weeks', 'Months', 'Days', 'Hours'],
      default: 'Weeks',
    },
    courseFee: {
      type: Number,
      required: [true, 'Course fee is required'],
      min: 0,
    },
    category: {
      type: String,
      default: 'General',
    },
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

courseSchema.pre('save', async function () {
  if (!this.courseId) {
    const count = await mongoose.model('Course').countDocuments();
    this.courseId = `CRS-${101 + count}`;
  }
});

export const Course = mongoose.model('Course', courseSchema);
