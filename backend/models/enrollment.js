import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: String,
      unique: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      default: null,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    agreedFee: {
      type: Number,
      required: [true, 'Agreed fee is required'],
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPayable: {
      type: Number,
      required: [true, 'Final payable amount is required'],
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Completed', 'Cancelled'],
      default: 'Active',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

enrollmentSchema.pre('save', async function () {
  if (!this.enrollmentId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Enrollment').countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    this.enrollmentId = `ENR-${year}-${sequence}`;
  }
});

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
