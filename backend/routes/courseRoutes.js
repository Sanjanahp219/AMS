import express from 'express';
import { Course } from '../models/course.js';
import { Batch } from '../models/batch.js';
import { Enrollment } from '../models/enrollment.js';

const router = express.Router();

// 1. GET ALL COURSES (With enrollment count)
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query).sort({ createdAt: -1 }).lean();

    // Attach enrollment counts to each course
    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => {
        const count = await Enrollment.countDocuments({ course: course._id });
        return { ...course, enrollmentCount: count };
      })
    );

    res.json(coursesWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET SINGLE COURSE DETAILS
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const batches = await Batch.find({ course: course._id });
    const enrollments = await Enrollment.find({ course: course._id })
      .populate('student')
      .populate('batch');

    res.json({
      course,
      batches,
      enrollments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. CREATE COURSE
router.post('/', async (req, res) => {
  try {
    const { name, code, description, duration, durationUnit, courseFee, category } = req.body;

    if (!name || !code || duration === undefined || courseFee === undefined) {
      return res.status(400).json({ message: 'Name, code, duration, and course fee are required' });
    }

    // Check duplicate code
    const existing = await Course.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: `Course code "${code}" already exists.` });
    }

    const courseCount = await Course.countDocuments();
    const courseId = `CRS-${101 + courseCount}`;

    const newCourse = new Course({
      courseId,
      name,
      code: code.trim().toUpperCase(),
      description: description || '',
      duration: Number(duration),
      durationUnit: durationUnit || 'Weeks',
      courseFee: Number(courseFee),
      category: category || 'General',
      status: 'Active',
    });

    const saved = await newCourse.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. UPDATE COURSE
router.put('/:id', async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. UPDATE STATUS (Active / Archived)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 6. DELETE COURSE
router.delete('/:id', async (req, res) => {
  try {
    const enrollmentCount = await Enrollment.countDocuments({ course: req.params.id });
    if (enrollmentCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete course with active enrollments. Archive it instead to preserve student history.',
      });
    }

    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
