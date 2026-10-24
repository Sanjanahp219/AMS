import express from 'express';
import mongoose from 'mongoose';
import { Student } from '../models/student.js';
import { Enrollment } from '../models/enrollment.js';
import { Payment } from '../models/payment.js';

const router = express.Router();

// Fallback in-memory list if Atlas is waiting for IP whitelist
let inMemoryStudents = [
  {
    _id: 'stu_demo_01',
    studentId: 'STU-2026-0001',
    name: 'Rahul Sharma',
    phone: '+91 98765 01001',
    email: 'rahul.sharma@example.com',
    dateOfBirth: '2002-05-14',
    gender: 'Male',
    address: '42 MG Road, Indiranagar',
    city: 'Bangalore',
    emergencyContact: '+91 98765 09999',
    status: 'Active',
    registrationDate: new Date('2026-05-10'),
    notes: 'Enrolled in MERN stack',
  },
  {
    _id: 'stu_demo_02',
    studentId: 'STU-2026-0002',
    name: 'Ananya Verma',
    phone: '+91 98765 01002',
    email: 'ananya.verma@example.com',
    dateOfBirth: '2001-08-22',
    gender: 'Female',
    address: '77 Residency Road',
    city: 'Bangalore',
    emergencyContact: '+91 98765 08888',
    status: 'Active',
    registrationDate: new Date('2026-05-12'),
    notes: 'Scholarship applicant',
  },
  {
    _id: 'stu_demo_03',
    studentId: 'STU-2026-0003',
    name: 'Karthik Nair',
    phone: '+91 98765 01003',
    email: 'karthik.nair@example.com',
    dateOfBirth: '2003-01-30',
    gender: 'Male',
    address: '15 Koramangala 4th Block',
    city: 'Bangalore',
    emergencyContact: '+91 98765 07777',
    status: 'Active',
    registrationDate: new Date('2026-05-15'),
    notes: 'Weekend batch preferred',
  },
];

// 1. GET ALL STUDENTS (With Search & Status Filter)
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let result = [...inMemoryStudents];
      if (status && status !== 'All') {
        result = result.filter((s) => s.status === status);
      }
      if (search) {
        const term = search.toLowerCase();
        result = result.filter(
          (s) =>
            s.name.toLowerCase().includes(term) ||
            s.studentId.toLowerCase().includes(term) ||
            s.phone.includes(term) ||
            s.email.toLowerCase().includes(term)
        );
      }
      return res.json(result);
    }

    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET SINGLE STUDENT (With Enrollments & Payments Profile)
router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const student = inMemoryStudents.find((s) => s._id === req.params.id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      return res.json({
        student,
        enrollments: [],
        payments: [],
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const enrollments = await Enrollment.find({ student: student._id })
      .populate('course')
      .populate('batch')
      .sort({ createdAt: -1 });

    const payments = await Payment.find({ student: student._id })
      .populate('enrollment')
      .sort({ paymentDate: -1 });

    res.json({
      student,
      enrollments,
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. CREATE NEW STUDENT
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, dateOfBirth, gender, address, city, emergencyContact, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Student name and phone number are required' });
    }

    const year = new Date().getFullYear();

    if (mongoose.connection.readyState !== 1) {
      const sequence = String(inMemoryStudents.length + 1).padStart(4, '0');
      const studentId = `STU-${year}-${sequence}`;
      const newStudent = {
        _id: 'stu_' + Date.now(),
        studentId,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : '',
        dateOfBirth: dateOfBirth || '',
        gender: gender || 'Male',
        address: address || '',
        city: city || '',
        emergencyContact: emergencyContact || '',
        notes: notes || '',
        status: 'Active',
        registrationDate: new Date(),
      };
      inMemoryStudents.unshift(newStudent);
      return res.status(201).json(newStudent);
    }

    // Atlas flow
    const count = await Student.countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    const studentId = `STU-${year}-${sequence}`;

    const newStudent = new Student({
      studentId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      dateOfBirth: dateOfBirth || '',
      gender: gender || '',
      address: address || '',
      city: city || '',
      emergencyContact: emergencyContact || '',
      notes: notes || '',
      status: 'Active',
      registrationDate: new Date(),
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. UPDATE STUDENT
router.put('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const idx = inMemoryStudents.findIndex((s) => s._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Student not found' });
      inMemoryStudents[idx] = { ...inMemoryStudents[idx], ...req.body };
      return res.json(inMemoryStudents[idx]);
    }

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. UPDATE STUDENT STATUS
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const student = inMemoryStudents.find((s) => s._id === req.params.id);
      if (!student) return res.status(404).json({ message: 'Student not found' });
      student.status = status;
      return res.json(student);
    }

    const student = await Student.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 6. DELETE STUDENT
router.delete('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      inMemoryStudents = inMemoryStudents.filter((s) => s._id !== req.params.id);
      return res.json({ message: 'Student record deleted successfully' });
    }

    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
