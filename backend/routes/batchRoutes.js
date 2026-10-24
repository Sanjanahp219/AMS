import express from 'express';
import { Batch } from '../models/batch.js';
import { Enrollment } from '../models/enrollment.js';

const router = express.Router();

// 1. GET ALL BATCHES (With course and current enrollment counts)
router.get('/', async (req, res) => {
  try {
    const { courseId, status, search } = req.query;
    const query = {};

    if (courseId) {
      query.course = courseId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { batchName: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } },
        { batchId: { $regex: search, $options: 'i' } },
      ];
    }

    const batches = await Batch.find(query)
      .populate('course', 'name code courseFee')
      .sort({ createdAt: -1 })
      .lean();

    // Attach real-time assigned enrollments count
    const batchesWithCounts = await Promise.all(
      batches.map(async (b) => {
        const count = await Enrollment.countDocuments({ batch: b._id, status: { $ne: 'Cancelled' } });
        return { ...b, currentEnrollments: count };
      })
    );

    res.json(batchesWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET SINGLE BATCH WITH ENROLLED STUDENTS
router.get('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('course');
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const enrollments = await Enrollment.find({ batch: batch._id, status: { $ne: 'Cancelled' } })
      .populate('student')
      .sort({ createdAt: -1 });

    res.json({
      batch,
      enrollments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. CREATE BATCH
router.post('/', async (req, res) => {
  try {
    const { batchName, course, startDate, endDate, startTime, endTime, instructor, maxCapacity } = req.body;

    if (!batchName || !course) {
      return res.status(400).json({ message: 'Batch name and course are required' });
    }

    const count = await Batch.countDocuments();
    const batchId = `BTC-${101 + count}`;

    const newBatch = new Batch({
      batchId,
      batchName,
      course,
      startDate: startDate || '',
      endDate: endDate || '',
      startTime: startTime || '09:00 AM',
      endTime: endTime || '11:00 AM',
      instructor: instructor || 'To Be Assigned',
      maxCapacity: Number(maxCapacity) || 30,
      status: 'Upcoming',
    });

    const saved = await newBatch.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. UPDATE BATCH
router.put('/:id', async (req, res) => {
  try {
    const updated = await Batch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. UPDATE BATCH STATUS
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Batch.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 6. DELETE BATCH
router.delete('/:id', async (req, res) => {
  try {
    const assignedCount = await Enrollment.countDocuments({ batch: req.params.id });
    if (assignedCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete batch with active enrollments. Reassign students first or close the batch.',
      });
    }

    const deleted = await Batch.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
