import express from 'express';
import { Enrollment } from '../models/enrollment.js';
import { Student } from '../models/student.js';
import { Course } from '../models/course.js';
import { Batch } from '../models/batch.js';
import { Payment } from '../models/payment.js';

const router = express.Router();

// 1. GET ALL ENROLLMENTS (With Student, Course, Batch populated)
router.get('/', async (req, res) => {
  try {
    const { status, studentId, courseId, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (studentId) {
      query.student = studentId;
    }

    if (courseId) {
      query.course = courseId;
    }

    let enrollments = await Enrollment.find(query)
      .populate('student', 'studentId name email phone status')
      .populate('course', 'courseId name code duration durationUnit courseFee')
      .populate('batch', 'batchId batchName startTime endTime instructor')
      .sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      enrollments = enrollments.filter(
        (e) =>
          e.student?.name?.toLowerCase().includes(term) ||
          e.student?.studentId?.toLowerCase().includes(term) ||
          e.course?.name?.toLowerCase().includes(term) ||
          e.course?.code?.toLowerCase().includes(term) ||
          e.enrollmentId?.toLowerCase().includes(term)
      );
    }

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET SINGLE ENROLLMENT DETAILS (With Payments)
router.get('/:id', async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student')
      .populate('course')
      .populate('batch');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    const payments = await Payment.find({ enrollment: enrollment._id }).sort({ paymentDate: -1 });

    res.json({
      enrollment,
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. CREATE NEW ENROLLMENT
router.post('/', async (req, res) => {
  try {
    const { studentId, courseId, batchId, agreedFee, discount, notes, status } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({ message: 'Student and Course are required for enrollment' });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Selected student does not exist' });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Selected course does not exist' });
    }

    if (course.status === 'Archived') {
      return res.status(400).json({ message: 'Cannot enroll in an archived course' });
    }

    // Check for duplicate active enrollment
    const duplicate = await Enrollment.findOne({
      student: student._id,
      course: course._id,
      status: { $in: ['Pending', 'Active'] },
    });

    if (duplicate) {
      return res.status(400).json({
        message: `Student "${student.name}" is already actively enrolled in "${course.name}" (ID: ${duplicate.enrollmentId}).`,
      });
    }

    // Check batch capacity if batch is provided
    if (batchId) {
      const batch = await Batch.findById(batchId);
      if (!batch) {
        return res.status(404).json({ message: 'Selected batch does not exist' });
      }

      if (batch.status === 'Closed' || batch.status === 'Completed') {
        return res.status(400).json({ message: `Cannot enroll in a ${batch.status.toLowerCase()} batch` });
      }

      const currentEnrolled = await Enrollment.countDocuments({ batch: batch._id, status: { $ne: 'Cancelled' } });
      if (currentEnrolled >= batch.maxCapacity) {
        return res.status(400).json({
          message: `Batch "${batch.batchName}" is full! Maximum capacity of ${batch.maxCapacity} reached.`,
        });
      }
    }

    // Fee calculations
    const originalFee = Number(agreedFee !== undefined ? agreedFee : course.courseFee);
    const disc = Math.max(0, Number(discount) || 0);
    const finalPayable = Math.max(0, originalFee - disc);

    // Concurrency-safe ID
    const year = new Date().getFullYear();
    const count = await Enrollment.countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    const enrollmentId = `ENR-${year}-${sequence}`;

    const newEnrollment = new Enrollment({
      enrollmentId,
      student: student._id,
      course: course._id,
      batch: batchId || null,
      enrollmentDate: new Date(),
      agreedFee: originalFee,
      discount: disc,
      finalPayable,
      paidAmount: 0,
      status: status || 'Active',
      notes: notes || '',
    });

    const saved = await newEnrollment.save();
    const populated = await Enrollment.findById(saved._id)
      .populate('student', 'name studentId email phone')
      .populate('course', 'name code courseFee')
      .populate('batch', 'batchName');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. UPDATE ENROLLMENT (Batch reassignment, Notes, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { batch, notes, discount, status } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (batch && batch !== String(enrollment.batch)) {
      const targetBatch = await Batch.findById(batch);
      if (!targetBatch) {
        return res.status(404).json({ message: 'Target batch does not exist' });
      }
      const currentCount = await Enrollment.countDocuments({ batch: targetBatch._id, status: { $ne: 'Cancelled' } });
      if (currentCount >= targetBatch.maxCapacity) {
        return res.status(400).json({ message: `Target batch is full (${targetBatch.maxCapacity} students)` });
      }
      enrollment.batch = batch;
    }

    if (notes !== undefined) enrollment.notes = notes;
    if (status !== undefined) enrollment.status = status;

    if (discount !== undefined) {
      enrollment.discount = Number(discount);
      enrollment.finalPayable = Math.max(0, enrollment.agreedFee - enrollment.discount);
    }

    const updated = await enrollment.save();
    const populated = await Enrollment.findById(updated._id)
      .populate('student')
      .populate('course')
      .populate('batch');

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. UPDATE STATUS (Pending, Active, Completed, Cancelled)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('student').populate('course').populate('batch');

    if (!updated) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
