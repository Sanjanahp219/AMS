import express from 'express';
import { Payment } from '../models/payment.js';
import { Enrollment } from '../models/enrollment.js';

const router = express.Router();

// 1. GET ALL PAYMENTS (With populated enrollment and student)
router.get('/', async (req, res) => {
  try {
    const { method, search, enrollmentId } = req.query;
    const query = {};

    if (method && method !== 'All') {
      query.paymentMethod = method;
    }

    if (enrollmentId) {
      query.enrollment = enrollmentId;
    }

    let payments = await Payment.find(query)
      .populate('student', 'name studentId phone email')
      .populate({
        path: 'enrollment',
        populate: { path: 'course', select: 'name code' },
      })
      .sort({ paymentDate: -1 });

    if (search) {
      const term = search.toLowerCase();
      payments = payments.filter(
        (p) =>
          p.receiptNumber?.toLowerCase().includes(term) ||
          p.paymentId?.toLowerCase().includes(term) ||
          p.student?.name?.toLowerCase().includes(term) ||
          p.student?.studentId?.toLowerCase().includes(term) ||
          p.referenceNumber?.toLowerCase().includes(term)
      );
    }

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET PAYMENTS FOR SPECIFIC ENROLLMENT
router.get('/enrollment/:enrollmentId', async (req, res) => {
  try {
    const payments = await Payment.find({ enrollment: req.params.enrollmentId }).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. RECORD A NEW PAYMENT
router.post('/', async (req, res) => {
  try {
    const { enrollmentId, amount, paymentMethod, referenceNumber, notes, paymentDate } = req.body;

    if (!enrollmentId || !amount) {
      return res.status(400).json({ message: 'Enrollment and payment amount are required' });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than zero' });
    }

    const enrollment = await Enrollment.findById(enrollmentId).populate('student course');
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment record not found' });
    }

    // Calculate current outstanding balance
    const currentPaid = Number(enrollment.paidAmount) || 0;
    const finalPayable = Number(enrollment.finalPayable) || 0;
    const balance = Math.max(0, finalPayable - currentPaid);

    if (payAmount > balance) {
      return res.status(400).json({
        message: `Payment amount (₹${payAmount}) exceeds the remaining balance (₹${balance}). Overpayment is not permitted.`,
      });
    }

    // Generate readable payment ID and receipt number
    const year = new Date().getFullYear();
    const count = await Payment.countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    const paymentId = `PAY-${year}-${sequence}`;
    const receiptNumber = `RCP-${year}-${sequence}`;

    const newPayment = new Payment({
      paymentId,
      receiptNumber,
      enrollment: enrollment._id,
      student: enrollment.student._id,
      amount: payAmount,
      paymentMethod: paymentMethod || 'Cash',
      referenceNumber: referenceNumber || '',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentStatus: 'Completed',
      notes: notes || '',
    });

    const savedPayment = await newPayment.save();

    // Update enrollment paidAmount
    enrollment.paidAmount = currentPaid + payAmount;
    await enrollment.save();

    const populatedPayment = await Payment.findById(savedPayment._id)
      .populate('student', 'name studentId phone email')
      .populate({
        path: 'enrollment',
        populate: { path: 'course', select: 'name code' },
      });

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: populatedPayment,
      remainingBalance: Math.max(0, finalPayable - enrollment.paidAmount),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. REFUND / CANCEL PAYMENT (Audit safe)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const previousStatus = payment.paymentStatus;
    payment.paymentStatus = status;
    if (notes) payment.notes = `${payment.notes} [Status changed to ${status}: ${notes}]`;

    await payment.save();

    // If changing from Completed to Refunded/Cancelled, subtract from enrollment paidAmount
    if (previousStatus === 'Completed' && (status === 'Refunded' || status === 'Cancelled')) {
      const enrollment = await Enrollment.findById(payment.enrollment);
      if (enrollment) {
        enrollment.paidAmount = Math.max(0, (enrollment.paidAmount || 0) - payment.amount);
        await enrollment.save();
      }
    }

    res.json({ message: `Payment marked as ${status}`, payment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
