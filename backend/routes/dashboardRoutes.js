import express from 'express';
import mongoose from 'mongoose';
import { Student } from '../models/student.js';
import { Course } from '../models/course.js';
import { Batch } from '../models/batch.js';
import { Enrollment } from '../models/enrollment.js';
import { Payment } from '../models/payment.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        totalStudents: 0,
        activeStudents: 0,
        totalCourses: 0,
        activeCourses: 0,
        totalBatches: 0,
        totalEnrollments: 0,
        activeEnrollments: 0,
        totalCollected: 0,
        outstandingBalance: 0,
        courseDistribution: [],
        trendData: [],
        recentStudents: [],
        recentEnrollments: [],
        recentPayments: [],
      });
    }

    // 1. Basic counts
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'Active' });
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ status: 'Active' });
    const totalBatches = await Batch.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const activeEnrollments = await Enrollment.countDocuments({ status: 'Active' });

    // 2. Financial Metrics
    // Sum of completed payments
    const paymentsAgg = await Payment.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: { _id: null, totalCollected: { $sum: '$amount' } } },
    ]);
    const totalCollected = paymentsAgg.length > 0 ? paymentsAgg[0].totalCollected : 0;

    // Sum of payable amounts across all active/completed enrollments
    const enrollmentsAgg = await Enrollment.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalAgreedFees: { $sum: '$agreedFee' },
          totalFinalPayable: { $sum: '$finalPayable' },
          totalPaid: { $sum: '$paidAmount' },
        },
      },
    ]);

    const totalFinalPayable = enrollmentsAgg.length > 0 ? enrollmentsAgg[0].totalFinalPayable : 0;
    const totalPaidOnEnrollments = enrollmentsAgg.length > 0 ? enrollmentsAgg[0].totalPaid : 0;
    const outstandingBalance = Math.max(0, totalFinalPayable - totalPaidOnEnrollments);

    // 3. Course Enrollment Distribution (for Bar Chart)
    const courses = await Course.find({ status: 'Active' }).select('name code');
    const courseDistribution = await Promise.all(
      courses.slice(0, 6).map(async (c) => {
        const count = await Enrollment.countDocuments({ course: c._id });
        return {
          courseName: c.code || c.name,
          fullName: c.name,
          enrollments: count,
        };
      })
    );

    // 4. Monthly Collection Trends
    const monthlyPayments = await Payment.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData = monthlyPayments.map((item) => ({
      month: monthNames[item._id - 1] || `M${item._id}`,
      collected: item.amount,
    }));

    // 5. Recent Activity
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name studentId phone registrationDate status');

    const recentEnrollments = await Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('student', 'name studentId')
      .populate('course', 'name code')
      .select('enrollmentId finalPayable paidAmount status');

    const recentPayments = await Payment.find()
      .sort({ paymentDate: -1 })
      .limit(5)
      .populate('student', 'name studentId')
      .select('receiptNumber amount paymentMethod paymentDate paymentStatus');

    res.json({
      totalStudents,
      activeStudents,
      totalCourses,
      activeCourses,
      totalBatches,
      totalEnrollments,
      activeEnrollments,
      totalCollected,
      outstandingBalance,
      courseDistribution,
      trendData,
      recentStudents,
      recentEnrollments,
      recentPayments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
