import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      unique: true,
      trim: true,
    },
    batchName: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required for a batch'],
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    startTime: {
      type: String,
      default: '09:00 AM',
    },
    endTime: {
      type: String,
      default: '11:00 AM',
    },
    instructor: {
      type: String,
      default: 'To Be Assigned',
      trim: true,
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Maximum capacity is required'],
      default: 30,
      min: 1,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Completed', 'Closed'],
      default: 'Upcoming',
    },
  },
  { timestamps: true }
);

batchSchema.pre('save', async function () {
  if (!this.batchId) {
    const count = await mongoose.model('Batch').countDocuments();
    this.batchId = `BTC-${101 + count}`;
  }
});

export const Batch = mongoose.model('Batch', batchSchema);
