import express from 'express';
import { Student } from '../models/student.js';
import { Course } from '../models/course.js';
import { Enrollment } from '../models/enrollment.js';
import { Payment } from '../models/payment.js';

const router = express.Router();

// Helper to convert array of objects to CSV string
const convertToCSV = (data, fields) => {
  if (!data || !data.length) return '';
  const header = fields.map((f) => `"${f.label}"`).join(',');
  const rows = data.map((item) =>
    fields
      .map((f) => {
        const val = f.value(item);
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  return [header, ...rows].join('\n');
};

// 1. STUDENTS REPORT
router.get('/students', async (req, res) => {
  try {
    const { format } = req.query;
    const students = await Student.find().sort({ createdAt: -1 });

    if (format === 'csv') {
      const fields = [
        { label: 'Student ID', value: (s) => s.studentId },
        { label: 'Name', value: (s) => s.name },
        { label: 'Phone', value: (s) => s.phone },
        { label: 'Email', value: (s) => s.email },
        { label: 'City', value: (s) => s.city },
        { label: 'Status', value: (s) => s.status },
        { label: 'Registration Date', value: (s) => new Date(s.registrationDate).toLocaleDateString() },
      ];
      const csv = convertToCSV(students, fields);
      res.header('Content-Type', 'text/csv');
      res.attachment('students_report.csv');
      return res.send(csv);
    }

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. ENROLLMENTS REPORT
router.get('/enrollments', async (req, res) => {
  try {
    const { format, status } = req.query;
    const query = status && status !== 'All' ? { status } : {};

    const enrollments = await Enrollment.find(query)
      .populate('student', 'name studentId phone')
      .populate('course', 'name code')
      .populate('batch', 'batchName')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const fields = [
        { label: 'Enrollment ID', value: (e) => e.enrollmentId },
        { label: 'Student Name', value: (e) => e.student?.name },
        { label: 'Student ID', value: (e) => e.student?.studentId },
        { label: 'Course', value: (e) => e.course?.name },
        { label: 'Batch', value: (e) => e.batch?.batchName || 'N/A' },
        { label: 'Course Fee', value: (e) => e.agreedFee },
        { label: 'Discount', value: (e) => e.discount },
        { label: 'Final Payable', value: (e) => e.finalPayable },
        { label: 'Amount Paid', value: (e) => e.paidAmount },
        { label: 'Balance', value: (e) => Math.max(0, e.finalPayable - e.paidAmount) },
        { label: 'Status', value: (e) => e.status },
      ];
      const csv = convertToCSV(enrollments, fields);
      res.header('Content-Type', 'text/csv');
      res.attachment('enrollments_report.csv');
      return res.send(csv);
    }

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. PAYMENTS REPORT
router.get('/payments', async (req, res) => {
  try {
    const { format, method } = req.query;
    const query = method && method !== 'All' ? { paymentMethod: method } : {};

    const payments = await Payment.find(query)
      .populate('student', 'name studentId')
      .populate({
        path: 'enrollment',
        populate: { path: 'course', select: 'name code' },
      })
      .sort({ paymentDate: -1 });

    if (format === 'csv') {
      const fields = [
        { label: 'Receipt No', value: (p) => p.receiptNumber },
        { label: 'Student Name', value: (p) => p.student?.name },
        { label: 'Student ID', value: (p) => p.student?.studentId },
        { label: 'Course', value: (p) => p.enrollment?.course?.name || 'N/A' },
        { label: 'Amount (INR)', value: (p) => p.amount },
        { label: 'Payment Method', value: (p) => p.paymentMethod },
        { label: 'Status', value: (p) => p.paymentStatus },
        { label: 'Date', value: (p) => new Date(p.paymentDate).toLocaleDateString() },
        { label: 'Reference No', value: (p) => p.referenceNumber || 'N/A' },
      ];
      const csv = convertToCSV(payments, fields);
      res.header('Content-Type', 'text/csv');
      res.attachment('payments_report.csv');
      return res.send(csv);
    }

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. OUTSTANDING BALANCE REPORT
router.get('/outstanding', async (req, res) => {
  try {
    const { format } = req.query;
    const enrollments = await Enrollment.find({ status: { $ne: 'Cancelled' } })
      .populate('student', 'name studentId phone email')
      .populate('course', 'name code')
      .sort({ createdAt: -1 });

    // Filter only those with remaining balance > 0
    const outstanding = enrollments
      .map((e) => {
        const balance = Math.max(0, e.finalPayable - (e.paidAmount || 0));
        return {
          enrollmentId: e.enrollmentId,
          studentName: e.student?.name,
          studentId: e.student?.studentId,
          phone: e.student?.phone,
          courseName: e.course?.name,
          courseCode: e.course?.code,
          finalPayable: e.finalPayable,
          paidAmount: e.paidAmount || 0,
          outstandingBalance: balance,
          status: e.status,
        };
      })
      .filter((item) => item.outstandingBalance > 0);

    if (format === 'csv') {
      const fields = [
        { label: 'Enrollment ID', value: (o) => o.enrollmentId },
        { label: 'Student Name', value: (o) => o.studentName },
        { label: 'Student ID', value: (o) => o.studentId },
        { label: 'Phone', value: (o) => o.phone },
        { label: 'Course', value: (o) => o.courseName },
        { label: 'Total Payable (INR)', value: (o) => o.finalPayable },
        { label: 'Amount Paid (INR)', value: (o) => o.paidAmount },
        { label: 'Outstanding Balance (INR)', value: (o) => o.outstandingBalance },
      ];
      const csv = convertToCSV(outstanding, fields);
      res.header('Content-Type', 'text/csv');
      res.attachment('outstanding_balances_report.csv');
      return res.send(csv);
    }

    res.json(outstanding);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
