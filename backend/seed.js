import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models/user.js';
import { Student } from './models/student.js';
import { Course } from './models/course.js';
import { Batch } from './models/batch.js';
import { Enrollment } from './models/enrollment.js';
import { Payment } from './models/payment.js';
import { AcademySettings } from './models/settings.js';

dotenv.config();

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('❌ MONGO_URI not found in .env');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB Atlas for seeding...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB Atlas!');

    // 1. Seed Academy Settings
    await AcademySettings.deleteMany({});
    await AcademySettings.create({
      academyName: 'AMS Academy',
      tagline: 'Simplifying Academy Management',
      contactEmail: 'contact@amsacademy.edu',
      contactPhone: '+91 98765 43210',
      address: '100 Knowledge Boulevard, Tech Hub',
      city: 'Bangalore',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    });
    console.log('✅ Academy settings seeded');

    // 2. Seed Users (Admin and Staff)
    await User.deleteMany({});
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const staffPassword = await bcrypt.hash('staff123', salt);

    const adminUser = await User.create({
      name: 'Academy Administrator',
      email: 'admin@ams.edu',
      password: adminPassword,
      role: 'Admin',
      phone: '+91 98888 11111',
      status: 'Active',
    });

    const staffUser = await User.create({
      name: 'Admissions Coordinator',
      email: 'staff@ams.edu',
      password: staffPassword,
      role: 'Staff',
      phone: '+91 98888 22222',
      status: 'Active',
    });
    console.log('✅ Users seeded: admin@ams.edu (pass: admin123) and staff@ams.edu (pass: staff123)');

    // 3. Seed Courses
    await Course.deleteMany({});
    const course1 = await Course.create({
      courseId: 'CRS-101',
      name: 'Full-Stack Web Development (MERN)',
      code: 'FS-MERN-01',
      description: 'Comprehensive modern web development with MongoDB, Express, React, and Node.js.',
      duration: 16,
      durationUnit: 'Weeks',
      courseFee: 35000,
      category: 'Software Engineering',
      status: 'Active',
    });

    const course2 = await Course.create({
      courseId: 'CRS-102',
      name: 'Data Science & Machine Learning',
      code: 'DS-ML-02',
      description: 'Hands-on Python, Pandas, Machine Learning models, and data visualization.',
      duration: 12,
      durationUnit: 'Weeks',
      courseFee: 40000,
      category: 'Data & AI',
      status: 'Active',
    });

    const course3 = await Course.create({
      courseId: 'CRS-103',
      name: 'UI/UX Design Masterclass',
      code: 'UI-UX-03',
      description: 'Figma wireframing, design systems, usability research, and interactive prototyping.',
      duration: 8,
      durationUnit: 'Weeks',
      courseFee: 25000,
      category: 'Design',
      status: 'Active',
    });

    const course4 = await Course.create({
      courseId: 'CRS-104',
      name: 'Mobile App Development with Flutter',
      code: 'MOB-FLUT-04',
      description: 'Build native iOS and Android applications with Dart and Flutter framework.',
      duration: 10,
      durationUnit: 'Weeks',
      courseFee: 30000,
      category: 'Mobile',
      status: 'Active',
    });
    console.log('✅ Courses seeded');

    // 4. Seed Batches
    await Batch.deleteMany({});
    const batch1 = await Batch.create({
      batchId: 'BTC-101',
      batchName: 'MERN Weekday Morning Batch',
      course: course1._id,
      startDate: '2026-06-01',
      endDate: '2026-09-20',
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      instructor: 'Vikram Sharma',
      maxCapacity: 25,
      status: 'Active',
    });

    const batch2 = await Batch.create({
      batchId: 'BTC-102',
      batchName: 'Data Science Weekend Intensive',
      course: course2._id,
      startDate: '2026-06-15',
      endDate: '2026-09-10',
      startTime: '10:00 AM',
      endTime: '02:00 PM',
      instructor: 'Pooja Reddy',
      maxCapacity: 20,
      status: 'Active',
    });

    const batch3 = await Batch.create({
      batchId: 'BTC-103',
      batchName: 'UI/UX Evening Batch',
      course: course3._id,
      startDate: '2026-07-01',
      endDate: '2026-08-25',
      startTime: '06:30 PM',
      endTime: '08:30 PM',
      instructor: 'Arjun Mehta',
      maxCapacity: 20,
      status: 'Upcoming',
    });
    console.log('✅ Batches seeded');

    // 5. Seed Students
    await Student.deleteMany({});
    const student1 = await Student.create({
      studentId: 'STU-2026-0001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 01001',
      dateOfBirth: '2002-05-14',
      gender: 'Male',
      address: '42 MG Road, Indiranagar',
      city: 'Bangalore',
      emergencyContact: '+91 98765 09999',
      registrationDate: new Date('2026-05-10'),
      status: 'Active',
    });

    const student2 = await Student.create({
      studentId: 'STU-2026-0002',
      name: 'Ananya Verma',
      email: 'ananya.verma@example.com',
      phone: '+91 98765 01002',
      dateOfBirth: '2001-08-22',
      gender: 'Female',
      address: '77 Residency Road',
      city: 'Bangalore',
      emergencyContact: '+91 98765 08888',
      registrationDate: new Date('2026-05-12'),
      status: 'Active',
    });

    const student3 = await Student.create({
      studentId: 'STU-2026-0003',
      name: 'Karthik Nair',
      email: 'karthik.nair@example.com',
      phone: '+91 98765 01003',
      dateOfBirth: '2003-01-30',
      gender: 'Male',
      address: '15 Koramangala 4th Block',
      city: 'Bangalore',
      emergencyContact: '+91 98765 07777',
      registrationDate: new Date('2026-05-15'),
      status: 'Active',
    });

    const student4 = await Student.create({
      studentId: 'STU-2026-0004',
      name: 'Sneha Patel',
      email: 'sneha.patel@example.com',
      phone: '+91 98765 01004',
      dateOfBirth: '2002-11-04',
      gender: 'Female',
      address: '88 Whitefield Main Road',
      city: 'Bangalore',
      emergencyContact: '+91 98765 06666',
      registrationDate: new Date('2026-05-18'),
      status: 'Active',
    });

    const student5 = await Student.create({
      studentId: 'STU-2026-0005',
      name: 'Mohammed Zayd',
      email: 'zayd.m@example.com',
      phone: '+91 98765 01005',
      dateOfBirth: '2000-03-19',
      gender: 'Male',
      address: '12 HSR Layout Sector 1',
      city: 'Bangalore',
      emergencyContact: '+91 98765 05555',
      registrationDate: new Date('2026-05-20'),
      status: 'Active',
    });
    console.log('✅ Students seeded');

    // 6. Seed Enrollments
    await Enrollment.deleteMany({});
    const enrollment1 = await Enrollment.create({
      enrollmentId: 'ENR-2026-0001',
      student: student1._id,
      course: course1._id,
      batch: batch1._id,
      enrollmentDate: new Date('2026-05-11'),
      agreedFee: 35000,
      discount: 3000,
      finalPayable: 32000,
      paidAmount: 32000, // Fully paid
      status: 'Active',
      notes: 'Early bird student discount applied',
    });

    const enrollment2 = await Enrollment.create({
      enrollmentId: 'ENR-2026-0002',
      student: student2._id,
      course: course2._id,
      batch: batch2._id,
      enrollmentDate: new Date('2026-05-13'),
      agreedFee: 40000,
      discount: 2000,
      finalPayable: 38000,
      paidAmount: 20000, // Partial payment
      status: 'Active',
      notes: 'Installment plan: First installment received',
    });

    const enrollment3 = await Enrollment.create({
      enrollmentId: 'ENR-2026-0003',
      student: student3._id,
      course: course1._id,
      batch: batch1._id,
      enrollmentDate: new Date('2026-05-16'),
      agreedFee: 35000,
      discount: 0,
      finalPayable: 35000,
      paidAmount: 15000, // Partial payment
      status: 'Active',
      notes: 'First installment of 15k paid',
    });

    const enrollment4 = await Enrollment.create({
      enrollmentId: 'ENR-2026-0004',
      student: student4._id,
      course: course3._id,
      batch: batch3._id,
      enrollmentDate: new Date('2026-05-19'),
      agreedFee: 25000,
      discount: 2500,
      finalPayable: 22500,
      paidAmount: 0, // Pending payment
      status: 'Pending',
      notes: 'Pending fee deposit',
    });

    const enrollment5 = await Enrollment.create({
      enrollmentId: 'ENR-2026-0005',
      student: student5._id,
      course: course4._id,
      batch: null,
      enrollmentDate: new Date('2026-05-21'),
      agreedFee: 30000,
      discount: 0,
      finalPayable: 30000,
      paidAmount: 30000, // Fully paid
      status: 'Active',
      notes: 'Full payment via UPI',
    });
    console.log('✅ Enrollments seeded');

    // 7. Seed Payments
    await Payment.deleteMany({});
    await Payment.create({
      paymentId: 'PAY-2026-0001',
      receiptNumber: 'RCP-2026-0001',
      enrollment: enrollment1._id,
      student: student1._id,
      amount: 32000,
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'NEFT992384910',
      paymentDate: new Date('2026-05-11'),
      paymentStatus: 'Completed',
      createdBy: adminUser._id,
      notes: 'Full payment received',
    });

    await Payment.create({
      paymentId: 'PAY-2026-0002',
      receiptNumber: 'RCP-2026-0002',
      enrollment: enrollment2._id,
      student: student2._id,
      amount: 20000,
      paymentMethod: 'UPI',
      referenceNumber: 'UPI982310192',
      paymentDate: new Date('2026-05-13'),
      paymentStatus: 'Completed',
      createdBy: staffUser._id,
      notes: 'Part 1 of 2 payment',
    });

    await Payment.create({
      paymentId: 'PAY-2026-0003',
      receiptNumber: 'RCP-2026-0003',
      enrollment: enrollment3._id,
      student: student3._id,
      amount: 15000,
      paymentMethod: 'Card',
      referenceNumber: 'TXN-CARD-4491',
      paymentDate: new Date('2026-05-16'),
      paymentStatus: 'Completed',
      createdBy: staffUser._id,
      notes: 'Initial deposit',
    });

    await Payment.create({
      paymentId: 'PAY-2026-0004',
      receiptNumber: 'RCP-2026-0004',
      enrollment: enrollment5._id,
      student: student5._id,
      amount: 30000,
      paymentMethod: 'UPI',
      referenceNumber: 'UPI998822331',
      paymentDate: new Date('2026-05-21'),
      paymentStatus: 'Completed',
      createdBy: adminUser._id,
      notes: 'Full course fee settlement',
    });
    console.log('✅ Payments seeded');

    console.log('\n🎉 ALL AMS DEMO DATA SEEDED SUCCESSFULLY INTO MONGODB ATLAS!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  }
};

seedData();
