import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      trim: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: [true, 'Enrollment reference is required'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be greater than 0'],
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Card', 'Other'],
      default: 'Cash',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ['Completed', 'Refunded', 'Cancelled'],
      default: 'Completed',
    },
    referenceNumber: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

paymentSchema.pre('save', async function () {
  const year = new Date().getFullYear();
  const count = await mongoose.model('Payment').countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  if (!this.paymentId) {
    this.paymentId = `PAY-${year}-${sequence}`;
  }
  if (!this.receiptNumber) {
    this.receiptNumber = `RCP-${year}-${sequence}`;
  }
});

export const Payment = mongoose.model('Payment', paymentSchema);
